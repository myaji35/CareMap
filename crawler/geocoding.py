"""
Geocoding Module - 주소를 위도/경도로 변환
"""
import requests
import time
import logging
from config import KAKAO_REST_API_KEY, REQUEST_TIMEOUT

logger = logging.getLogger(__name__)


def geocode_address(address: str) -> dict:
    """
    Kakao Geocoding API를 사용하여 주소를 위도/경도로 변환

    Args:
        address: 주소 문자열

    Returns:
        {'lat': float, 'lng': float} 또는 None
    """
    if not address or not address.strip():
        logger.warning("Empty address provided")
        return None

    if not KAKAO_REST_API_KEY:
        logger.error("Kakao REST API Key not configured")
        return None

    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {"query": address.strip()}

    try:
        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=REQUEST_TIMEOUT
        )
        response.raise_for_status()
        data = response.json()

        if data.get('documents'):
            doc = data['documents'][0]
            result = {
                'lat': float(doc['y']),
                'lng': float(doc['x'])
            }
            logger.info(f"Geocoded: {address} -> ({result['lat']}, {result['lng']})")
            return result
        else:
            logger.warning(f"No geocoding result for address: {address}")
            return None

    except requests.exceptions.Timeout:
        logger.error(f"Geocoding timeout for address: {address}")
        return None
    except requests.exceptions.RequestException as e:
        logger.error(f"Geocoding request failed: {e}")
        return None
    except (KeyError, ValueError, IndexError) as e:
        logger.error(f"Geocoding response parsing error: {e}")
        return None


def geocode_batch(addresses: list, delay: float = 0.1) -> dict:
    """
    여러 주소를 배치로 Geocoding

    Args:
        addresses: 주소 리스트
        delay: API 호출 간 딜레이 (초)

    Returns:
        {address: {lat, lng}} 딕셔너리
    """
    results = {}

    for i, address in enumerate(addresses):
        if address in results:
            continue

        logger.info(f"Geocoding {i+1}/{len(addresses)}: {address}")
        result = geocode_address(address)

        if result:
            results[address] = result
        else:
            results[address] = None

        # Rate limiting
        if i < len(addresses) - 1:
            time.sleep(delay)

    success_count = sum(1 for v in results.values() if v is not None)
    logger.info(f"Geocoding complete: {success_count}/{len(addresses)} successful")

    return results
