from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('dashboard/', views.dashboard_view),

    # Students
    path('students/', views.student_list_create),
    path('students/<int:pk>/', views.student_detail),
    path('students/<int:student_id>/grades/', views.student_grades),

    # Faculty
    path('faculty/', views.faculty_list_create),
    path('faculty/<int:pk>/', views.faculty_detail),

    # Courses
    path('courses/', views.course_list_create),
    path('courses/<int:pk>/', views.course_detail),

    # Enrollments
    path('enrollments/', views.enrollment_list_create),
    path('enrollments/<int:pk>/', views.enrollment_delete),

    # Attendance
    path('attendance/', views.attendance_list),
    path('attendance/bulk-mark/', views.attendance_bulk_mark),
    path('attendance/student/<int:student_id>/stats/', views.attendance_student_stats),

    # Exams
    path('exams/', views.exam_list_create),
    path('exams/submit-grades/', views.exam_submit_grades),
    path('exams/<int:pk>/', views.exam_detail),
    path('exams/<int:exam_id>/results/', views.exam_results),

    # Fees
    path('fees/structures/', views.fee_structure_list_create),
    path('fees/structures/<int:pk>/', views.fee_structure_detail),
    path('fees/payments/', views.fee_payment_list_create),
    path('fees/student/<int:student_id>/summary/', views.fee_student_summary),
    path('fees/stats/', views.fee_stats),

    # Library
    path('library/books/', views.book_list_create),
    path('library/books/<int:pk>/', views.book_detail),
    path('library/issues/', views.book_issue_list_create),
    path('library/issues/<int:issue_id>/return/', views.book_return),

    # Hostel
    path('hostel/stats/', views.hostel_stats),
    path('hostel/', views.hostel_list_create),
    path('hostel/<int:pk>/', views.hostel_detail),
    path('hostel/rooms/', views.hostel_room_list_create),
    path('hostel/rooms/<int:pk>/', views.hostel_room_detail),
    path('hostel/allotments/', views.hostel_allotment_list_create),
    path('hostel/allotments/<int:pk>/', views.hostel_allotment_detail),
    path('hostel/complaints/', views.hostel_complaint_list_create),
    path('hostel/complaints/<int:pk>/', views.hostel_complaint_update),

    # Transport
    path('transport/stats/', views.transport_stats),
    path('transport/routes/', views.transport_route_list_create),
    path('transport/routes/<int:pk>/', views.transport_route_detail),
    path('transport/vehicles/', views.vehicle_list_create),
    path('transport/vehicles/<int:pk>/', views.vehicle_detail),
    path('transport/passes/', views.transport_pass_list_create),
    path('transport/passes/<int:pk>/', views.transport_pass_detail),

    # Laboratory
    path('labs/stats/', views.lab_stats),
    path('labs/', views.lab_list_create),
    path('labs/<int:pk>/', views.lab_detail),
    path('labs/equipment/', views.lab_equipment_list_create),
    path('labs/equipment/<int:pk>/', views.lab_equipment_detail),
    path('labs/bookings/', views.lab_booking_list_create),
    path('labs/bookings/<int:pk>/', views.lab_booking_detail),

    # Cafeteria
    path('cafeteria/stats/', views.cafeteria_stats),
    path('cafeteria/menu/', views.cafeteria_menu_list_create),
    path('cafeteria/menu/<int:pk>/', views.cafeteria_menu_detail),
    path('cafeteria/orders/', views.cafeteria_order_list_create),
    path('cafeteria/orders/<int:pk>/', views.cafeteria_order_detail),

    # Placement
    path('placement/stats/', views.placement_stats),
    path('placement/companies/', views.company_list_create),
    path('placement/companies/<int:pk>/', views.company_detail),
    path('placement/drives/', views.drive_list_create),
    path('placement/drives/<int:pk>/', views.drive_detail),
    path('placement/applications/', views.application_list_create),
    path('placement/applications/<int:pk>/', views.application_detail),
    path('placement/interviews/', views.interview_list_create),
    path('placement/interviews/<int:pk>/', views.interview_detail),

    # Sports
    path('sports/stats/', views.sports_stats),
    path('sports/', views.sport_list_create),
    path('sports/<int:pk>/', views.sport_detail),
    path('sports/tournaments/', views.tournament_list_create),
    path('sports/tournaments/<int:pk>/', views.tournament_detail),
    path('sports/participations/', views.participation_list_create),
    path('sports/participations/<int:pk>/', views.participation_detail),
    path('sports/achievements/', views.achievement_list_create),
    path('sports/achievements/<int:pk>/', views.achievement_detail),
]
