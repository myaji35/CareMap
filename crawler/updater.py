# crawler/updater.py
# (필요 라이브러리: selenium, beautifulsoup4, requests, psycopg2)

def crawl_data_from_site():
    # 1. Selenium을 사용하여 웹사이트에 접속하고, 검색 조건(전체) 설정 후 데이터 로드
    # ... 크롤링 로직 ...
    # 결과는 아래와 같은 딕셔너리 리스트 형태로 반환
    crawled_data = [
        {'code': 'A1234', 'name': '행복요양원', 'type': '방문요양', 'capacity': 100, 'current': 85, 'address': '...', 'hours': '...'},
        # ...
    ]
    return crawled_data

def geocode_address(address):
    # 2. 주소를 위도/경도로 변환하는 함수 (카카오 API 등 활용)
    # ... 지오코딩 로직 ...
    return {'lat': 37.5088, 'lng': 127.0454}

def sync_database(crawled_data):
    # 3. DB에 연결
    conn = connect_to_db()
    cur = conn.cursor()

    for data in crawled_data:
        # 4. 기관 코드로 DB에서 기존 데이터 조회
        cur.execute("SELECT * FROM institutions WHERE institution_code = %s", (data['code'],))
        existing_data = cur.fetchone()

        # 5. 변경 사항 감지
        is_changed = (
            not existing_data or
            existing_data['name'] != data['name'] or
            existing_data['address'] != data['address'] or
            existing_data['capacity'] != data['capacity'] or
            existing_data['current_headcount'] != data['current']
        )

        if is_changed:
            print(f"'{data['name']}' 기관 정보 변경 감지. DB 업데이트 및 이력 기록 시작.")

            if existing_data:
                # 6-A. 변경이 감지되면, 기존 데이터를 history 테이블에 기록
                cur.execute(
                    """INSERT INTO institution_history (institution_id, recorded_date, name, address, capacity, current_headcount)
                       VALUES (%s, CURRENT_DATE, %s, %s, %s, %s)""",
                    (existing_data['id'], existing_data['name'], existing_data['address'], existing_data['capacity'], existing_data['current_headcount'])
                )

            # 6-B. 좌표 변환
            coords = geocode_address(data['address'])

            # 6-C. institutions 테이블을 최신 정보로 업데이트 (또는 신규 삽입)
            # (UPSERT 로직: 코드가 존재하면 UPDATE, 없으면 INSERT)
            cur.execute(
                """INSERT INTO institutions (institution_code, name, ...)
                   VALUES (%s, %s, ...)
                   ON CONFLICT (institution_code) DO UPDATE SET name = EXCLUDED.name, ...""",
                (data['code'], data['name'], ...)
            )

    conn.commit()
    cur.close()
    conn.close()
    print("데이터 동기화 완료!")

# --- 메인 실행 ---
if __name__ == "__main__":
    latest_data = crawl_data_from_site()
    sync_database(latest_data)