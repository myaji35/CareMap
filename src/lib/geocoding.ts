/**
 * Kakao Geocoding API 유틸리티
 * 주소를 좌표(위도, 경도)로 변환합니다.
 */

type GeocodingResult = {
  latitude: number;
  longitude: number;
  address: string;
};

type KakaoGeocodingResponse = {
  meta: {
    total_count: number;
  };
  documents: Array<{
    address_name: string;
    x: string; // 경도
    y: string; // 위도
  }>;
};

/**
 * 주소를 좌표로 변환하는 함수
 * @param address 변환할 주소
 * @returns 좌표 정보 (위도, 경도)
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    console.error('KAKAO_REST_API_KEY가 설정되지 않았습니다.');
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodedAddress}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error(
        `Geocoding API 오류: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data: KakaoGeocodingResponse = await response.json();

    if (data.meta.total_count === 0) {
      console.warn(`좌표를 찾을 수 없는 주소: ${address}`);
      return null;
    }

    const document = data.documents[0];

    return {
      latitude: parseFloat(document.y),
      longitude: parseFloat(document.x),
      address: document.address_name,
    };
  } catch (error) {
    console.error('Geocoding 오류:', error);
    return null;
  }
}

/**
 * 여러 주소를 배치로 변환하는 함수 (Rate Limiting 고려)
 * @param addresses 주소 배열
 * @param delayMs 각 요청 간 지연 시간 (기본 100ms)
 * @returns 좌표 정보 배열
 */
export async function geocodeAddressBatch(
  addresses: string[],
  delayMs: number = 100
): Promise<(GeocodingResult | null)[]> {
  const results: (GeocodingResult | null)[] = [];

  for (const address of addresses) {
    const result = await geocodeAddress(address);
    results.push(result);

    // Rate Limiting 방지를 위한 지연
    if (addresses.indexOf(address) < addresses.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
