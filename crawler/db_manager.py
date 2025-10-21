"""
Database Manager - PostgreSQL 연동
"""
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import date
import logging
from config import DB_CONFIG

logger = logging.getLogger(__name__)


class DatabaseManager:
    """PostgreSQL 데이터베이스 관리 클래스"""

    def __init__(self):
        self.conn = None
        self.cursor = None

    def connect(self):
        """데이터베이스 연결"""
        try:
            self.conn = psycopg2.connect(**DB_CONFIG)
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            logger.info("Database connected successfully")
            return True
        except psycopg2.Error as e:
            logger.error(f"Database connection failed: {e}")
            return False

    def disconnect(self):
        """데이터베이스 연결 종료"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        logger.info("Database disconnected")

    def create_tables(self):
        """테이블 생성 (존재하지 않는 경우)"""
        try:
            # institutions 테이블
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS institutions (
                    id SERIAL PRIMARY KEY,
                    institution_code VARCHAR(20) UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    service_type VARCHAR(100),
                    capacity INT,
                    current_headcount INT,
                    address VARCHAR(255),
                    operating_hours TEXT,
                    latitude DECIMAL(10, 8),
                    longitude DECIMAL(11, 8),
                    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # 인덱스 생성
            self.cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_institution_code
                ON institutions(institution_code)
            """)
            self.cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_location
                ON institutions(latitude, longitude)
            """)
            self.cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_service_type
                ON institutions(service_type)
            """)

            # institution_history 테이블
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS institution_history (
                    id SERIAL PRIMARY KEY,
                    institution_id INT REFERENCES institutions(id) ON DELETE CASCADE,
                    recorded_date DATE NOT NULL,
                    name VARCHAR(255),
                    address VARCHAR(255),
                    capacity INT,
                    current_headcount INT
                )
            """)

            # 인덱스 생성
            self.cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_institution_history_id
                ON institution_history(institution_id)
            """)
            self.cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_recorded_date
                ON institution_history(recorded_date)
            """)

            self.conn.commit()
            logger.info("Tables created successfully")
            return True

        except psycopg2.Error as e:
            self.conn.rollback()
            logger.error(f"Table creation failed: {e}")
            return False

    def upsert_institution(self, data: dict) -> bool:
        """
        기관 데이터 UPSERT (삽입 또는 업데이트)

        Args:
            data: 기관 데이터 딕셔너리

        Returns:
            성공 여부
        """
        try:
            # 기존 데이터 조회
            self.cursor.execute(
                "SELECT id, name, address, capacity, current_headcount "
                "FROM institutions WHERE institution_code = %s",
                (data['code'],)
            )
            existing = self.cursor.fetchone()

            # 변경 감지
            if existing:
                is_changed = (
                    existing['name'] != data.get('name') or
                    existing['address'] != data.get('address') or
                    existing['capacity'] != data.get('capacity') or
                    existing['current_headcount'] != data.get('current')
                )

                if is_changed:
                    # 히스토리 기록
                    self.cursor.execute(
                        """
                        INSERT INTO institution_history
                        (institution_id, recorded_date, name, address, capacity, current_headcount)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        """,
                        (
                            existing['id'],
                            date.today(),
                            existing['name'],
                            existing['address'],
                            existing['capacity'],
                            existing['current_headcount']
                        )
                    )
                    logger.info(f"History recorded for: {data['code']}")

            # UPSERT
            self.cursor.execute(
                """
                INSERT INTO institutions
                (institution_code, name, service_type, capacity, current_headcount,
                 address, operating_hours, latitude, longitude, last_updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (institution_code)
                DO UPDATE SET
                    name = EXCLUDED.name,
                    service_type = EXCLUDED.service_type,
                    capacity = EXCLUDED.capacity,
                    current_headcount = EXCLUDED.current_headcount,
                    address = EXCLUDED.address,
                    operating_hours = EXCLUDED.operating_hours,
                    latitude = EXCLUDED.latitude,
                    longitude = EXCLUDED.longitude,
                    last_updated_at = CURRENT_TIMESTAMP
                """,
                (
                    data['code'],
                    data.get('name'),
                    data.get('type'),
                    data.get('capacity'),
                    data.get('current'),
                    data.get('address'),
                    data.get('hours'),
                    data.get('lat'),
                    data.get('lng')
                )
            )

            return True

        except psycopg2.Error as e:
            logger.error(f"Upsert failed for {data.get('code')}: {e}")
            return False

    def sync_institutions(self, institutions_data: list) -> dict:
        """
        여러 기관 데이터 동기화

        Args:
            institutions_data: 기관 데이터 리스트

        Returns:
            {'success': int, 'failed': int, 'total': int}
        """
        success_count = 0
        failed_count = 0

        try:
            for data in institutions_data:
                if self.upsert_institution(data):
                    success_count += 1
                else:
                    failed_count += 1

            self.conn.commit()
            logger.info(
                f"Sync completed: {success_count} success, "
                f"{failed_count} failed, {len(institutions_data)} total"
            )

            return {
                'success': success_count,
                'failed': failed_count,
                'total': len(institutions_data)
            }

        except Exception as e:
            self.conn.rollback()
            logger.error(f"Sync failed: {e}")
            return {
                'success': 0,
                'failed': len(institutions_data),
                'total': len(institutions_data)
            }

    def get_all_institutions(self) -> list:
        """모든 기관 조회"""
        try:
            self.cursor.execute("SELECT * FROM institutions ORDER BY id")
            return self.cursor.fetchall()
        except psycopg2.Error as e:
            logger.error(f"Query failed: {e}")
            return []

    def get_statistics(self) -> dict:
        """통계 조회"""
        try:
            self.cursor.execute("SELECT COUNT(*) as total FROM institutions")
            total = self.cursor.fetchone()['total']

            self.cursor.execute(
                """
                SELECT service_type, COUNT(*) as count
                FROM institutions
                GROUP BY service_type
                """
            )
            by_type = {row['service_type']: row['count'] for row in self.cursor.fetchall()}

            return {
                'total': total,
                'by_service_type': by_type
            }
        except psycopg2.Error as e:
            logger.error(f"Statistics query failed: {e}")
            return {'total': 0, 'by_service_type': {}}
