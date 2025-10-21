# backend/views.py
from django.http import JsonResponse
from .models import Institution, InstitutionHistory


def get_institutions_for_map(request):
    """
    지도에 표시할 최신 기관 정보 목록을 반환하는 API
    API Endpoint: /api/v1/institutions/
    """
    # 사용자의 지역(시/군/구)에 따라 필터링하는 로직 추가 가능
    institutions = Institution.objects.all().values(
        "id",
        "name",
        "service_type",
        "address",
        "capacity",
        "current_headcount",
        "latitude",
        "longitude",
    )
    return JsonResponse(list(institutions), safe=False)


def get_institution_history(request, institution_id):
    """
    특정 기관의 변동 이력 전체를 시계열 그래프용으로 반환하는 API
    API Endpoint: /api/v1/institutions/<int:institution_id>/history/
    """
    history_records = InstitutionHistory.objects.filter(
        institution_id=institution_id
    ).order_by("recorded_date")

    # 최신 정보도 포함하여 전달
    latest_record = Institution.objects.get(id=institution_id)

    response_data = {
        "institution_name": latest_record.name,
        "history": [
            {
                "date": r.recorded_date,
                "capacity": r.capacity,
                "current": r.current_headcount,
            }
            for r in history_records
        ]
        + [
            {
                "date": latest_record.last_updated_at.date(),
                "capacity": latest_record.capacity,
                "current": latest_record.current_headcount,
            }
        ],
    }
    return JsonResponse(response_data)
