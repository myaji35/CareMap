// frontend/map.js

// 1. 지도 초기화 (카카오 지도 API 기준)
const mapContainer = document.getElementById('map');
const mapOption = { center: new kakao.maps.LatLng(37.566826, 126.9786567), level: 3 };
const map = new kakao.maps.Map(mapContainer, mapOption);

// 2. 서버에서 기관 데이터 가져오기
fetch('/api/v1/institutions/')
    .then(response => response.json())
    .then(data => {
        data.forEach(inst => {
            // 3. 각 기관 위치에 커스텀 마커(파이그래프) 생성
            createPieChartMarker(inst);
        });
    });

function createPieChartMarker(inst) {
    const ratio = inst.current_headcount / inst.capacity;
    const percentage = Math.min(ratio, 1); // 현원이 정원을 초과해도 시각적으로는 100%로 제한
    const color = ratio > 1 ? '#ff4d4d' : '#4d94ff'; // 초과 시 경고 색상

    // 파이그래프 모양의 SVG HTML 생성 (CSS Conic Gradient 등 다른 방식도 가능)
    const content = `
        <div class="pie-marker" style="background: conic-gradient(${color} ${percentage * 360}deg, #ddd 0deg);">
            <span class="pie-text">${inst.current_headcount}<br>/<br>${inst.capacity}</span>
        </div>`;

    const position = new kakao.maps.LatLng(inst.latitude, inst.longitude);
    const customOverlay = new kakao.maps.CustomOverlay({
        position: position,
        content: content,
        yAnchor: 1
    });
    customOverlay.setMap(map);

    // 4. 마우스오버 이벤트 처리
    const infoContent = `
        <div class="info-window">
            <strong>${inst.name}</strong><br>
            <span>종류: ${inst.service_type}</span><br>
            <span>주소: ${inst.address}</span><br>
            <button onclick="showHistory(${inst.id})">변동 이력 보기</button>
        </div>`;
    
    const infowindow = new kakao.maps.InfoWindow({ content: infoContent, removable: true });
    
    kakao.maps.event.addListener(customOverlay, 'mouseover', () => {
        infowindow.open(map, customOverlay);
    });
}

// 5. '변동 이력 보기' 버튼 클릭 시 시계열 그래프 표시
function showHistory(institutionId) {
    fetch(`/api/v1/institutions/${institutionId}/history/`)
        .then(response => response.json())
        .then(data => {
            // 모달 창을 띄우고, Chart.js를 이용해 시계열 그래프를 그리는 로직
            const labels = data.history.map(h => h.date);
            const capacityData = data.history.map(h => h.capacity);
            const currentData = data.history.map(h => h.current);

            // ... Chart.js로 그래프 그리는 코드 ...
            console.log(`'${data.institution_name}'의 이력 데이터:`, data.history);
            alert(`'${data.institution_name}'의 시계열 그래프를 표시합니다.`);
        });
}