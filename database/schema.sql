-- institutions 테이블: 기관의 '최신' 정보를 저장합니다. 지도 표시에 사용됩니다.
CREATE TABLE institutions (
    id SERIAL PRIMARY KEY,                          -- 기관 고유 ID
    institution_code VARCHAR(20) UNIQUE NOT NULL,   -- 기관 고유 코드 (웹사이트 기준, 식별용)
    name VARCHAR(255) NOT NULL,                     -- 기관명
    service_type VARCHAR(100),                      -- 급여종류
    capacity INT,                                   -- 정원
    current_headcount INT,                          -- 현원
    address VARCHAR(255),                           -- 주소
    operating_hours TEXT,                           -- 운영시간
    latitude DECIMAL(10, 8),                        -- 위도
    longitude DECIMAL(11, 8),                       -- 경도
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- 최종 업데이트 일시
);

-- institution_history 테이블: 데이터 '변경 이력'을 월 단위로 기록합니다. 시계열 분석에 사용됩니다.
CREATE TABLE institution_history (
    id SERIAL PRIMARY KEY,
    institution_id INT REFERENCES institutions(id), -- institutions 테이블과 연결
    recorded_date DATE NOT NULL,                    -- 기록된 날짜 (매월 1일)
    name VARCHAR(255),                              -- 변경 당시 기관명
    address VARCHAR(255),                           -- 변경 당시 주소
    capacity INT,                                   -- 변경 당시 정원
    current_headcount INT                           -- 변경 당시 현원
);