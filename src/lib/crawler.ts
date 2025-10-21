/**
 * 장기요양기관 크롤러
 * https://www.longtermcare.or.kr/npbs/r/a/201/selectXLtcoSrch
 */

import { chromium } from 'playwright';

export type CrawledInstitution = {
  institutionCode: string;
  name: string;
  serviceType: string;
  address: string;
  capacity: number;
  currentHeadcount: number;
};

export type CrawlerProgress = {
  current: number;
  total: number;
  percentage: number;
  message: string;
};

/**
 * 장기요양기관 목록을 크롤링하는 함수
 * @param maxPages 크롤링할 최대 페이지 수 (기본값: 1)
 * @param onProgress 진행상황 콜백 함수
 */
export async function crawlInstitutions(
  maxPages: number = 1,
  onProgress?: (progress: CrawlerProgress) => void
): Promise<CrawledInstitution[]> {
  const targetUrl = process.env.CRAWLER_TARGET_URL;

  if (!targetUrl) {
    throw new Error('CRAWLER_TARGET_URL이 설정되지 않았습니다.');
  }

  const institutions: CrawledInstitution[] = [];
  let browser;

  try {
    // 브라우저 실행 (성능 최적화 옵션 추가)
    let launchOptions: any = {
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
      ],
    };

    // macOS/Windows에서 시스템 Chrome 사용 시도
    try {
      browser = await chromium.launch({ ...launchOptions, channel: 'chrome' });
      console.log('✓ Chrome 브라우저 사용');
    } catch (e) {
      // Chrome 없으면 Chromium 사용
      console.log('Chrome 없음 - Playwright Chromium 사용');
      browser = await chromium.launch(launchOptions);
    }

    if (!browser) {
      throw new Error('브라우저 실행 실패');
    }

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    // 불필요한 리소스 차단 (속도 향상)
    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    onProgress?.({
      current: 0,
      total: maxPages,
      percentage: 0,
      message: '브라우저 실행 중...',
    });

    // 페이지 로드 (더 빠른 대기 전략)
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    onProgress?.({
      current: 0,
      total: maxPages,
      percentage: 5,
      message: '페이지 로드 완료',
    });

    // 테이블이 로드될 때까지만 대기
    await page.waitForSelector('#ltco_info_list', { timeout: 10000 });

    console.log('페이지 로드 완료:', await page.title());

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      onProgress?.({
        current: pageNum,
        total: maxPages,
        percentage: Math.floor((pageNum / maxPages) * 80),
        message: `${pageNum}페이지 크롤링 중...`,
      });

      // 실제 데이터가 있는 테이블 찾기 (id="ltco_info_list")
      // 여러 번 시도 (로딩 지연 대응)
      let rows = [];
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        rows = await page.$$('#ltco_info_list tbody tr');
        if (rows.length > 0) {
          break;
        }
        console.log(`[페이지 ${pageNum}] 데이터 대기 중... (시도 ${retryCount + 1}/${maxRetries})`);
        await page.waitForTimeout(2000);
        retryCount++;
      }

      console.log(`[페이지 ${pageNum}] 발견된 기관 행 수: ${rows.length}`);

      if (rows.length === 0) {
        console.log(`[페이지 ${pageNum}] 데이터 없음 - 크롤링 종료`);
        break;
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          // 모든 td 추출
          const cells = await row.$$('td');
          if (cells.length === 0) continue;

          // 첫 번째 행만 디버깅 로그 출력
          if (pageNum === 1 && i === 0) {
            console.log(`\n[디버깅] 첫 번째 행의 셀 개수: ${cells.length}`);
            for (let j = 0; j < cells.length; j++) {
              const cellText = (await cells[j].textContent()) || '';
              console.log(`  셀 ${j + 1}: ${cellText.substring(0, 100)}`);
            }
          }

          // td#ltcMapList 안의 텍스트 추출 (기관 정보 포함)
          const infoCell = await row.$('td#ltcMapList');
          if (!infoCell) continue;

          const infoText = (await infoCell.textContent()) || '';

          // 번호와 기관명 추출 (예: "1.한솔노인복지센터")
          const nameMatch = infoText.match(/(\d+)\.(.*?)(?:\s|$)/);
          if (!nameMatch) continue;

          const institutionCode = `LTCO_${nameMatch[1].padStart(6, '0')}`;
          const name = nameMatch[2].trim();

          // 주소 추출 (주소 패턴 찾기)
          let address = '';
          const addressMatch = infoText.match(
            /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충청|충북|충남|전라|전북|전남|경상|경북|경남|제주)[^\☎]+/
          );
          if (addressMatch) {
            address = addressMatch[0].trim();
          }

          // 서비스 유형 추출 (주야간보호, 노인요양시설 등)
          let serviceType = '노인요양시설';
          if (infoText.includes('주야간보호')) {
            serviceType = '주야간보호';
          } else if (infoText.includes('방문요양')) {
            serviceType = '방문요양';
          } else if (infoText.includes('단기보호')) {
            serviceType = '단기보호';
          } else if (infoText.includes('치매')) {
            serviceType = '치매전담형';
          }

          // 정원과 현원 추출 (다른 td에서 찾기)
          let capacity = 0;
          let currentHeadcount = 0;

          // 모든 셀의 텍스트를 확인하여 정원/현원 찾기
          for (const cell of cells) {
            const cellText = (await cell.textContent()) || '';

            // "정원: 30" 또는 "30명" 같은 패턴 찾기
            const capacityMatch = cellText.match(/정원[:\s]*(\d+)|입소정원[:\s]*(\d+)/);
            if (capacityMatch) {
              capacity = parseInt(capacityMatch[1] || capacityMatch[2]);
            }

            // "현원: 25" 또는 "25명" 같은 패턴 찾기
            const headcountMatch = cellText.match(/현원[:\s]*(\d+)|입소현원[:\s]*(\d+)/);
            if (headcountMatch) {
              currentHeadcount = parseInt(headcountMatch[1] || headcountMatch[2]);
            }
          }

          // infoText에서도 정원/현원 찾기 시도
          if (capacity === 0) {
            const capacityMatch = infoText.match(/정원[:\s]*(\d+)|입소정원[:\s]*(\d+)/);
            if (capacityMatch) {
              capacity = parseInt(capacityMatch[1] || capacityMatch[2]);
            }
          }

          if (currentHeadcount === 0) {
            const headcountMatch = infoText.match(/현원[:\s]*(\d+)|입소현원[:\s]*(\d+)/);
            if (headcountMatch) {
              currentHeadcount = parseInt(headcountMatch[1] || headcountMatch[2]);
            }
          }

          institutions.push({
            institutionCode,
            name,
            serviceType,
            address,
            capacity,
            currentHeadcount,
          });

          // 첫 10개만 로그 출력
          if (institutions.length <= 10) {
            console.log(
              `✓ ${institutions.length}. ${name} | ${serviceType} | 정원:${capacity} 현원:${currentHeadcount} | ${address.substring(0, 20)}...`
            );
          }
        } catch (error) {
          console.error(`[페이지 ${pageNum}] 행 ${i + 1} 파싱 오류:`, error);
          continue;
        }
      }

      // 다음 페이지로 이동 (마지막 페이지가 아닌 경우)
      if (pageNum < maxPages) {
        try {
          // 다양한 방식으로 다음 페이지 버튼 찾기
          let nextButton = null;

          // 1. 일반적인 "다음" 버튼 (class 또는 id)
          nextButton = await page.$('a.next, button.next, a#next, button#next');

          // 2. title 또는 alt 속성으로 찾기
          if (!nextButton) {
            nextButton = await page.$('a[title*="다음"], button[title*="다음"]');
          }

          // 3. 텍스트로 "다음" 또는 ">" 포함하는 링크 찾기
          if (!nextButton) {
            const allLinks = await page.$$('a, button');
            for (const link of allLinks) {
              const text = (await link.textContent()) || '';
              const trimmedText = text.trim();
              if (trimmedText === '다음' || trimmedText === '>' || trimmedText === 'Next') {
                nextButton = link;
                break;
              }
            }
          }

          // 4. JavaScript 함수 호출 방식 (onclick="goPage(2)" 등)
          if (!nextButton) {
            const pageLinks = await page.$$('a[onclick*="goPage"], a[onclick*="movePage"], a[onclick*="goToPage"]');
            if (pageLinks.length > 0) {
              // 다음 페이지 번호로 이동하는 링크 찾기
              for (const link of pageLinks) {
                const onclick = (await link.getAttribute('onclick')) || '';
                const match = onclick.match(/goPage\((\d+)\)|movePage\((\d+)\)|goToPage\((\d+)\)/);
                if (match) {
                  const targetPage = parseInt(match[1] || match[2] || match[3]);
                  if (targetPage === pageNum + 1) {
                    nextButton = link;
                    break;
                  }
                }
              }
            }
          }

          if (nextButton) {
            console.log(`[페이지 ${pageNum}] → ${pageNum + 1} 이동`);

            // 현재 테이블의 첫 번째 행 저장 (변경 감지용)
            const currentFirstRow = await page.$eval(
              '#ltco_info_list tbody tr:first-child',
              (el) => el.textContent || ''
            ).catch(() => '');

            // 다음 페이지 클릭
            await nextButton.click();

            // 페이지가 실제로 변경될 때까지 대기 (최대 10초)
            await page.waitForFunction(
              (oldContent) => {
                const newRow = document.querySelector('#ltco_info_list tbody tr:first-child');
                return newRow && newRow.textContent !== oldContent;
              },
              { timeout: 10000 },
              currentFirstRow
            ).catch(async () => {
              // 실패하면 기본 대기
              console.log(`[페이지 ${pageNum + 1}] 페이지 변경 감지 실패 - 기본 대기`);
              await page.waitForTimeout(3000);
            });

            // 추가 안정화 대기
            await page.waitForTimeout(1000);
            console.log(`[페이지 ${pageNum + 1}] 로딩 완료`);
          } else {
            console.log(`[페이지 ${pageNum}] 다음 페이지 버튼 없음 - 크롤링 종료`);
            break;
          }
        } catch (error) {
          console.error(`[페이지 ${pageNum}] 다음 페이지 이동 실패:`, error);
          break;
        }
      }
    }

    onProgress?.({
      current: maxPages,
      total: maxPages,
      percentage: 100,
      message: `크롤링 완료: ${institutions.length}개 기관 수집`,
    });

    return institutions;
  } catch (error) {
    console.error('크롤링 오류:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * 전체 페이지 수를 가져오는 함수
 */
export async function getTotalPages(): Promise<number> {
  const targetUrl = process.env.CRAWLER_TARGET_URL;

  if (!targetUrl) {
    throw new Error('CRAWLER_TARGET_URL이 설정되지 않았습니다.');
  }

  let browser;

  try {
    // 브라우저 실행 (성능 최적화 옵션 추가)
    let launchOptions: any = {
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
      ],
    };

    // macOS/Windows에서 시스템 Chrome 사용 시도
    try {
      browser = await chromium.launch({ ...launchOptions, channel: 'chrome' });
      console.log('✓ Chrome 브라우저 사용 (getTotalPages)');
    } catch (e) {
      // Chrome 없으면 Chromium 사용
      console.log('Chrome 없음 - Playwright Chromium 사용 (getTotalPages)');
      browser = await chromium.launch(launchOptions);
    }

    if (!browser) {
      throw new Error('브라우저 실행 실패');
    }

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    // 불필요한 리소스 차단 (속도 향상)
    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    console.log('페이지 로딩 시작:', targetUrl);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#ltco_info_list', { timeout: 10000 });

    let totalPages = 1;

    try {
      // HTML 내용 저장 (디버깅용)
      const content = await page.content();
      console.log('페이지 로드 완료. HTML 길이:', content.length);

      // 패턴 1: "Total 44101(1/4411 page)" 형식 찾기 (우선순위 높음)
      const totalPagePattern = content.match(/Total\s+\d+\s*\((\d+)\s*\/\s*(\d+)\s+page\)/i);
      if (totalPagePattern) {
        totalPages = parseInt(totalPagePattern[2]);
        console.log(`✓ Total 페이지 정보에서 발견: ${totalPagePattern[2]}페이지 (현재: ${totalPagePattern[1]}페이지)`);
      }

      // 패턴 2: "1/100 페이지" 형식의 텍스트 찾기
      if (totalPages === 1) {
        const pageTextMatch = content.match(/(\d+)\s*\/\s*(\d+)\s*페이지/);
        if (pageTextMatch) {
          totalPages = parseInt(pageTextMatch[2]);
          console.log(`텍스트에서 발견된 페이지 수: ${totalPages}`);
        }
      }

      // 패턴 3: JavaScript 변수에서 totalPage 찾기
      if (totalPages === 1) {
        const totalPageMatch = content.match(
          /totalPage[s]?\s*[=:]\s*['"]?(\d+)['"]?|total[_-]?page[s]?\s*[=:]\s*['"]?(\d+)['"]?/i
        );
        if (totalPageMatch) {
          totalPages = parseInt(totalPageMatch[1] || totalPageMatch[2]);
          console.log(`스크립트에서 발견된 페이지 수: ${totalPages}`);
        }
      }

      // 패턴 4: 페이징 영역의 모든 a 태그 검색
      if (totalPages === 1) {
        const allLinks = await page.$$('a');
        console.log(`총 링크 수: ${allLinks.length}`);

        const pageNumbers: number[] = [];
        for (const link of allLinks) {
          const text = (await link.textContent()) || '';
          const href = (await link.getAttribute('href')) || '';

          // 페이지 번호로 보이는 링크 찾기
          if (href.includes('page') || /^\d+$/.test(text.trim())) {
            const num = parseInt(text.trim());
            if (!isNaN(num) && num > 0) {
              pageNumbers.push(num);
            }
          }
        }

        if (pageNumbers.length > 0) {
          totalPages = Math.max(...pageNumbers);
          console.log(`링크에서 발견된 최대 페이지: ${totalPages}`);
        }
      }

      // 패턴 5: 마지막 페이지 버튼 찾기
      if (totalPages === 1) {
        const lastPageButton = await page.$('a[title*="마지막"], a[title*="끝"], .last, .end');
        if (lastPageButton) {
          const href = (await lastPageButton.getAttribute('href')) || '';
          const onclick = (await lastPageButton.getAttribute('onclick')) || '';

          // href나 onclick에서 페이지 번호 추출
          const numMatch = (href + onclick).match(/page[=:](\d+)|goPage\((\d+)\)/i);
          if (numMatch) {
            totalPages = parseInt(numMatch[1] || numMatch[2]);
            console.log(`마지막 페이지 버튼에서 발견: ${totalPages}`);
          }
        }
      }

      console.log(`✓ 최종 전체 페이지 수: ${totalPages}`);
    } catch (error) {
      console.error('페이지 수 파싱 오류:', error);
    }

    return totalPages;
  } catch (error) {
    console.error('페이지 수 조회 오류:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * 간단한 테스트용 크롤링 함수 (첫 페이지만)
 */
export async function crawlInstitutionsTest(): Promise<CrawledInstitution[]> {
  return crawlInstitutions(1);
}
