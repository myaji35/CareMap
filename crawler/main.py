#!/usr/bin/env python3
"""
CareMap Crawler - 장기요양기관 데이터 수집
"""
import logging
import sys
import os
from datetime import datetime
from db_manager import DatabaseManager
from geocoding import geocode_batch
import json

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/crawler.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


def load_sample_data():
    """
    샘플 데이터 로드 (실제 크롤링 전 테스트용)
    실제 웹사이트 크롤링은 복잡하므로, 먼저 샘플 데이터로 시스템을 구축합니다.
    """
    return [
        {
            'code': 'A1234567',
            'name': '행복요양원',
            'type': '방문요양',
            'capacity': 100,
            'current': 85,
            'address': '서울특별시 강남구 테헤란로 123',
            'hours': '09:00-18:00'
        },
        {
            'code': 'A1234568',
            'name': '사랑요양원',
            'type': '주간보호',
            'capacity': 50,
            'current': 45,
            'address': '서울특별시 서초구 서초대로 456',
            'hours': '08:00-17:00'
        },
        {
            'code': 'A1234569',
            'name': '평화요양원',
            'type': '방문요양',
            'capacity': 80,
            'current': 50,
            'address': '서울특별시 송파구 올림픽로 789',
            'hours': '09:00-18:00'
        },
        {
            'code': 'B2000001',
            'name': '온누리실버센터',
            'type': '단기보호',
            'capacity': 60,
            'current': 58,
            'address': '경기도 성남시 분당구 판교역로 100',
            'hours': '24시간'
        },
        {
            'code': 'B2000002',
            'name': '효도요양원',
            'type': '방문요양',
            'capacity': 70,
            'current': 40,
            'address': '경기도 용인시 수지구 죽전로 200',
            'hours': '09:00-18:00'
        },
        {
            'code': 'C3000001',
            'name': '햇살좋은집',
            'type': '주간보호',
            'capacity': 40,
            'current': 38,
            'address': '인천광역시 남동구 구월로 300',
            'hours': '08:00-17:00'
        },
        {
            'code': 'D4000001',
            'name': '늘푸른요양원',
            'type': '방문요양',
            'capacity': 90,
            'current': 75,
            'address': '부산광역시 해운대구 해운대로 400',
            'hours': '09:00-18:00'
        },
        {
            'code': 'E5000001',
            'name': '은빛나래요양센터',
            'type': '주간보호',
            'capacity': 55,
            'current': 50,
            'address': '대전광역시 유성구 대학로 500',
            'hours': '08:00-17:00'
        }
    ]


def main():
    """메인 실행 함수"""
    logger.info("=" * 60)
    logger.info("CareMap Crawler Started")
    logger.info(f"Start Time: {datetime.now()}")
    logger.info("=" * 60)

    # 1. 데이터베이스 연결
    logger.info("\n[Step 1] Connecting to database...")
    db = DatabaseManager()

    if not db.connect():
        logger.error("Database connection failed. Exiting...")
        return

    # 2. 테이블 생성
    logger.info("\n[Step 2] Creating tables...")
    if not db.create_tables():
        logger.error("Table creation failed. Exiting...")
        db.disconnect()
        return

    # 3. 샘플 데이터 로드
    logger.info("\n[Step 3] Loading sample data...")
    institutions_data = load_sample_data()
    logger.info(f"Loaded {len(institutions_data)} institutions")

    # 4. 주소 Geocoding
    logger.info("\n[Step 4] Geocoding addresses...")
    addresses = [inst['address'] for inst in institutions_data]
    geocode_results = geocode_batch(addresses)

    # Geocoding 결과를 데이터에 추가
    for inst in institutions_data:
        coords = geocode_results.get(inst['address'])
        if coords:
            inst['lat'] = coords['lat']
            inst['lng'] = coords['lng']
        else:
            inst['lat'] = None
            inst['lng'] = None
            logger.warning(f"Geocoding failed for: {inst['name']}")

    # 5. 데이터베이스 동기화
    logger.info("\n[Step 5] Syncing to database...")
    result = db.sync_institutions(institutions_data)

    logger.info(f"\nSync Result:")
    logger.info(f"  - Total: {result['total']}")
    logger.info(f"  - Success: {result['success']}")
    logger.info(f"  - Failed: {result['failed']}")

    # 6. 통계 출력
    logger.info("\n[Step 6] Database Statistics:")
    stats = db.get_statistics()
    logger.info(f"  - Total Institutions: {stats['total']}")
    logger.info(f"  - By Service Type:")
    for service_type, count in stats['by_service_type'].items():
        logger.info(f"    * {service_type}: {count}")

    # 7. 연결 종료
    db.disconnect()

    logger.info("\n" + "=" * 60)
    logger.info("CareMap Crawler Completed")
    logger.info(f"End Time: {datetime.now()}")
    logger.info("=" * 60)


if __name__ == '__main__':
    # logs 디렉토리 생성
    os.makedirs('logs', exist_ok=True)

    try:
        main()
    except KeyboardInterrupt:
        logger.info("\nCrawler interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"\nUnexpected error: {e}", exc_info=True)
        sys.exit(1)
