"""
Crawler Configuration
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database Configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'caremap_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', '')
}

# Kakao API
KAKAO_REST_API_KEY = os.getenv('KAKAO_REST_API_KEY', '')

# Crawling Settings
CRAWL_TARGET_URL = os.getenv(
    'CRAWL_TARGET_URL',
    'https://www.longtermcare.or.kr/npbs/index.jsp'
)
REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', '30'))
RETRY_LIMIT = int(os.getenv('RETRY_LIMIT', '3'))

# Logging
LOG_FILE = 'logs/crawler.log'
LOG_LEVEL = 'INFO'
