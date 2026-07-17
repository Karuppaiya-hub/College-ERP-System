from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from datetime import date, timedelta

from .models import (
    Student, Faculty, Course, Enrollment, Attendance,
    Exam, Grade, FeeStructure, FeePayment, Book, BookIssue,
    Hostel, HostelRoom, HostelAllotment, HostelComplaint,
    TransportRoute, Vehicle, TransportPass,
    Laboratory, LabEquipment, LabBooking,
    CafeteriaMenu, CafeteriaOrder, CafeteriaOrderItem,
    Company, PlacementDrive, PlacementApplication, InterviewSchedule,
    Sport, Tournament, SportParticipation, SportAchievement,
)
from .serializers import (
    StudentSerializer, StudentListSerializer,
    FacultySerializer, FacultyListSerializer,
    CourseSerializer, EnrollmentSerializer,
    AttendanceSerializer, BulkAttendanceSerializer,
    ExamSerializer, GradeSerializer, BulkGradeSubmitSerializer,
    FeeStructureSerializer, FeePaymentSerializer,
    BookSerializer, BookIssueSerializer,
    HostelSerializer, HostelRoomSerializer, HostelAllotmentSerializer, HostelComplaintSerializer,
    TransportRouteSerializer, VehicleSerializer, TransportPassSerializer,
    LaboratorySerializer, LabEquipmentSerializer, LabBookingSerializer,
    CafeteriaMenuSerializer, CafeteriaOrderSerializer,
    CompanySerializer, PlacementDriveSerializer, PlacementApplicationSerializer, InterviewScheduleSerializer,
    SportSerializer, TournamentSerializer, SportParticipationSerializer, SportAchievementSerializer,
)


# ─────────────────────────────────────────────
# Student Views
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def student_list_create(request):
    if request.method == 'GET':
        queryset = Student.objects.all()
        dept = request.query_params.get('department')
        semester = request.query_params.get('semester')
        search = request.query_params.get('search')
        status_filter = request.query_params.get('status')

        if dept:
            queryset = queryset.filter(department=dept)
        if semester:
            queryset = queryset.filter(semester=semester)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(roll_no__icontains=search) |
                Q(email__icontains=search)
            )
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = StudentListSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def student_detail(request, pk):
    try:
        student = Student.objects.get(pk=pk)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StudentSerializer(student)
        return Response(serializer.data)

    elif request.method in ('PUT', 'PATCH'):
        partial = request.method == 'PATCH'
        serializer = StudentSerializer(student, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        student.delete()
        return Response({'message': 'Student deleted.'}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────
# Faculty Views
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def faculty_list_create(request):
    if request.method == 'GET':
        queryset = Faculty.objects.all()
        dept = request.query_params.get('department')
        search = request.query_params.get('search')
        status_filter = request.query_params.get('status')

        if dept:
            queryset = queryset.filter(department=dept)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(employee_id__icontains=search) |
                Q(email__icontains=search)
            )
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = FacultyListSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = FacultySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def faculty_detail(request, pk):
    try:
        faculty = Faculty.objects.get(pk=pk)
    except Faculty.DoesNotExist:
        return Response({'error': 'Faculty not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = FacultySerializer(faculty)
        return Response(serializer.data)

    elif request.method in ('PUT', 'PATCH'):
        partial = request.method == 'PATCH'
        serializer = FacultySerializer(faculty, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        faculty.delete()
        return Response({'message': 'Faculty deleted.'}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────
# Course Views
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def course_list_create(request):
    if request.method == 'GET':
        queryset = Course.objects.select_related('faculty').all()
        dept = request.query_params.get('department')
        semester = request.query_params.get('semester')
        search = request.query_params.get('search')
        status_filter = request.query_params.get('status')
        faculty_id = request.query_params.get('faculty')

        if dept:
            queryset = queryset.filter(department=dept)
        if semester:
            queryset = queryset.filter(semester=semester)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(code__icontains=search)
            )
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if faculty_id:
            queryset = queryset.filter(faculty_id=faculty_id)

        serializer = CourseSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def course_detail(request, pk):
    try:
        course = Course.objects.select_related('faculty').get(pk=pk)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CourseSerializer(course)
        return Response(serializer.data)

    elif request.method in ('PUT', 'PATCH'):
        partial = request.method == 'PATCH'
        serializer = CourseSerializer(course, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        course.delete()
        return Response({'message': 'Course deleted.'}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────
# Enrollment Views
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def enrollment_list_create(request):
    if request.method == 'GET':
        queryset = Enrollment.objects.select_related('student', 'course').all()
        student_id = request.query_params.get('student')
        course_id = request.query_params.get('course')
        status_filter = request.query_params.get('status')

        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = EnrollmentSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = EnrollmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def enrollment_delete(request, pk):
    try:
        enrollment = Enrollment.objects.get(pk=pk)
    except Enrollment.DoesNotExist:
        return Response({'error': 'Enrollment not found.'}, status=status.HTTP_404_NOT_FOUND)
    enrollment.delete()
    return Response({'message': 'Enrollment deleted.'}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────
# Attendance Views
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def attendance_list(request):
    if request.method == 'GET':
        queryset = Attendance.objects.select_related(
            'student', 'course', 'marked_by'
        ).all()
        student_id = request.query_params.get('student')
        course_id = request.query_params.get('course')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        status_filter = request.query_params.get('status')

        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = AttendanceSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = AttendanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def attendance_bulk_mark(request):
    serializer = BulkAttendanceSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    try:
        course = Course.objects.get(pk=data['course'])
    except Course.DoesNotExist:
        return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

    marked_by = None
    if data.get('marked_by'):
        try:
            marked_by = Faculty.objects.get(pk=data['marked_by'])
        except Faculty.DoesNotExist:
            pass

    created = []
    for att in data['attendances']:
        try:
            student = Student.objects.get(pk=att['student'])
        except Student.DoesNotExist:
            continue

        obj, was_created = Attendance.objects.update_or_create(
            student=student,
            course=course,
            date=data['date'],
            defaults={
                'status': att['status'],
                'remarks': att.get('remarks', ''),
                'marked_by': marked_by,
            }
        )
        created.append(AttendanceSerializer(obj).data)

    return Response({
        'message': f'{len(created)} attendance records saved.',
        'attendances': created,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_student_stats(request, student_id):
    try:
        student = Student.objects.get(pk=student_id)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

    course_id = request.query_params.get('course')
    queryset = Attendance.objects.filter(student=student)
    if course_id:
        queryset = queryset.filter(course_id=course_id)

    total = queryset.count()
    present = queryset.filter(status='Present').count()
    absent = queryset.filter(status='Absent').count()
    late = queryset.filter(status='Late').count()
    excused = queryset.filter(status='Excused').count()

    return Response({
        'student': StudentListSerializer(student).data,
        'total_classes': total,
        'present': present,
        'absent': absent,
        'late': late,
        'excused': excused,
        'attendance_percentage': round((present / total * 100), 2) if total > 0 else 0,
    })


# ─────────────────────────────────────────────
# Exam & Grade Views
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def exam_list_create(request):
    if request.method == 'GET':
        queryset = Exam.objects.select_related('course').all()
        course_id = request.query_params.get('course')
        exam_type = request.query_params.get('exam_type')
        status_filter = request.query_params.get('status')

        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if exam_type:
            queryset = queryset.filter(exam_type=exam_type)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = ExamSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ExamSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def exam_detail(request, pk):
    try:
        exam = Exam.objects.select_related('course').get(pk=pk)
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ExamSerializer(exam)
        return Response(serializer.data)

    elif request.method in ('PUT', 'PATCH'):
        partial = request.method == 'PATCH'
        serializer = ExamSerializer(exam, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        exam.delete()
        return Response({'message': 'Exam deleted.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def exam_results(request, exam_id):
    try:
        exam = Exam.objects.get(pk=exam_id)
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found.'}, status=status.HTTP_404_NOT_FOUND)

    grades = Grade.objects.filter(exam=exam).select_related('student')
    serializer = GradeSerializer(grades, many=True)

    return Response({
        'exam': ExamSerializer(exam).data,
        'results': serializer.data,
        'total_students': grades.count(),
        'average_marks': grades.aggregate(avg=Avg('marks_obtained'))['avg'] or 0,
        'pass_count': grades.filter(marks_obtained__gte=exam.pass_marks).count(),
        'fail_count': grades.filter(marks_obtained__lt=exam.pass_marks).count(),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def exam_submit_grades(request):
    serializer = BulkGradeSubmitSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    try:
        exam = Exam.objects.get(pk=data['exam'])
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found.'}, status=status.HTTP_404_NOT_FOUND)

    created = []
    for grade_data in data['grades']:
        try:
            student = Student.objects.get(pk=grade_data['student'])
        except Student.DoesNotExist:
            continue

        obj, _ = Grade.objects.update_or_create(
            student=student,
            exam=exam,
            defaults={
                'marks_obtained': grade_data['marks_obtained'],
                'grade': grade_data.get('grade', ''),
                'remarks': grade_data.get('remarks', ''),
            }
        )
        created.append(GradeSerializer(obj).data)

    return Response({
        'message': f'{len(created)} grades submitted.',
        'grades': created,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_grades(request, student_id):
    try:
        student = Student.objects.get(pk=student_id)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

    grades = Grade.objects.filter(student=student).select_related('exam', 'exam__course')
    serializer = GradeSerializer(grades, many=True)

    return Response({
        'student': StudentListSerializer(student).data,
        'grades': serializer.data,
    })


# ─────────────────────────────────────────────
# Fee Views
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def fee_structure_list_create(request):
    if request.method == 'GET':
        queryset = FeeStructure.objects.all()
        dept = request.query_params.get('department')
        semester = request.query_params.get('semester')
        academic_year = request.query_params.get('academic_year')

        if dept:
            queryset = queryset.filter(department=dept)
        if semester:
            queryset = queryset.filter(semester=semester)
        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)

        serializer = FeeStructureSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = FeeStructureSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def fee_structure_detail(request, pk):
    try:
        structure = FeeStructure.objects.get(pk=pk)
    except FeeStructure.DoesNotExist:
        return Response({'error': 'Fee structure not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = FeeStructureSerializer(structure)
        return Response(serializer.data)

    elif request.method in ('PUT', 'PATCH'):
        partial = request.method == 'PATCH'
        serializer = FeeStructureSerializer(structure, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        structure.delete()
        return Response({'message': 'Fee structure deleted.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def fee_payment_list_create(request):
    if request.method == 'GET':
        queryset = FeePayment.objects.select_related('student', 'structure').all()
        student_id = request.query_params.get('student')
        status_filter = request.query_params.get('status')
        method = request.query_params.get('method')

        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if method:
            queryset = queryset.filter(payment_method=method)

        serializer = FeePaymentSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = FeePaymentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fee_student_summary(request, student_id):
    try:
        student = Student.objects.get(pk=student_id)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

    payments = FeePayment.objects.filter(student=student).select_related('structure')
    total_paid = payments.filter(status__in=['Paid', 'Partial']).aggregate(
        total=Sum('amount_paid')
    )['total'] or 0

    structures = FeeStructure.objects.filter(
        department=student.department, semester=student.semester
    )
    total_fee = structures.aggregate(total=Sum('amount'))['total'] or 0

    return Response({
        'student': StudentListSerializer(student).data,
        'total_fee': total_fee,
        'total_paid': total_paid,
        'balance': float(total_fee) - float(total_paid),
        'payments': FeePaymentSerializer(payments, many=True).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fee_stats(request):
    total_collected = FeePayment.objects.filter(
        status__in=['Paid', 'Partial']
    ).aggregate(total=Sum('amount_paid'))['total'] or 0

    total_pending = FeePayment.objects.filter(status='Pending').count()
    total_partial = FeePayment.objects.filter(status='Partial').count()
    total_paid = FeePayment.objects.filter(status='Paid').count()

    by_department = (
        FeePayment.objects.filter(status__in=['Paid', 'Partial'])
        .values('student__department')
        .annotate(total=Sum('amount_paid'))
        .order_by('student__department')
    )

    return Response({
        'total_collected': total_collected,
        'total_paid_transactions': total_paid,
        'total_partial_transactions': total_partial,
        'total_pending_transactions': total_pending,
        'by_department': list(by_department),
    })


# ─────────────────────────────────────────────
# Library Views
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def book_list_create(request):
    if request.method == 'GET':
        queryset = Book.objects.all()
        search = request.query_params.get('search')
        category = request.query_params.get('category')

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(author__icontains=search) |
                Q(isbn__icontains=search)
            )
        if category:
            queryset = queryset.filter(category=category)

        serializer = BookSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def book_detail(request, pk):
    try:
        book = Book.objects.get(pk=pk)
    except Book.DoesNotExist:
        return Response({'error': 'Book not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = BookSerializer(book)
        return Response(serializer.data)

    elif request.method in ('PUT', 'PATCH'):
        partial = request.method == 'PATCH'
        serializer = BookSerializer(book, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        book.delete()
        return Response({'message': 'Book deleted.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def book_issue_list_create(request):
    if request.method == 'GET':
        queryset = BookIssue.objects.select_related('book', 'student').all()
        student_id = request.query_params.get('student')
        book_id = request.query_params.get('book')
        status_filter = request.query_params.get('status')

        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if book_id:
            queryset = queryset.filter(book_id=book_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = BookIssueSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data.copy()
        try:
            book = Book.objects.get(pk=data.get('book'))
        except Book.DoesNotExist:
            return Response({'error': 'Book not found.'}, status=status.HTTP_404_NOT_FOUND)

        if book.available_copies <= 0:
            return Response(
                {'error': 'No copies available for issue.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = BookIssueSerializer(data=data)
        if serializer.is_valid():
            issue = serializer.save()
            book.available_copies -= 1
            book.save()
            return Response(BookIssueSerializer(issue).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_return(request, issue_id):
    try:
        issue = BookIssue.objects.select_related('book').get(pk=issue_id)
    except BookIssue.DoesNotExist:
        return Response({'error': 'Issue record not found.'}, status=status.HTTP_404_NOT_FOUND)

    if issue.status == 'Returned':
        return Response(
            {'error': 'Book already returned.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    issue.return_date = date.today()
    issue.status = 'Returned'

    if issue.return_date > issue.due_date:
        overdue_days = (issue.return_date - issue.due_date).days
        issue.fine = overdue_days * 10

    issue.save()

    book = issue.book
    book.available_copies += 1
    book.save()

    return Response({
        'message': 'Book returned successfully.',
        'fine': float(issue.fine),
        'issue': BookIssueSerializer(issue).data,
    })


# ─────────────────────────────────────────────
# Hostel Views
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def hostel_list_create(request):
    if request.method == 'GET':
        serializer = HostelSerializer(Hostel.objects.all(), many=True)
        return Response(serializer.data)
    serializer = HostelSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def hostel_detail(request, pk):
    try:
        hostel = Hostel.objects.get(pk=pk)
    except Hostel.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(HostelSerializer(hostel).data)
    elif request.method in ('PUT', 'PATCH'):
        s = HostelSerializer(hostel, data=request.data, partial=request.method == 'PATCH')
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    hostel.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def hostel_room_list_create(request):
    if request.method == 'GET':
        qs = HostelRoom.objects.select_related('hostel').all()
        hostel_id = request.query_params.get('hostel')
        room_status = request.query_params.get('status')
        if hostel_id:
            qs = qs.filter(hostel_id=hostel_id)
        if room_status:
            qs = qs.filter(status=room_status)
        return Response(HostelRoomSerializer(qs, many=True).data)
    s = HostelRoomSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def hostel_room_detail(request, pk):
    try:
        room = HostelRoom.objects.get(pk=pk)
    except HostelRoom.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(HostelRoomSerializer(room).data)
    elif request.method in ('PUT', 'PATCH'):
        s = HostelRoomSerializer(room, data=request.data, partial=request.method == 'PATCH')
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    room.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def hostel_allotment_list_create(request):
    if request.method == 'GET':
        qs = HostelAllotment.objects.select_related('student', 'room', 'room__hostel').all()
        hostel_id = request.query_params.get('hostel')
        st = request.query_params.get('status')
        if hostel_id:
            qs = qs.filter(room__hostel_id=hostel_id)
        if st:
            qs = qs.filter(status=st)
        return Response(HostelAllotmentSerializer(qs, many=True).data)
    s = HostelAllotmentSerializer(data=request.data)
    if s.is_valid():
        allotment = s.save()
        room = allotment.room
        room.current_occupancy += 1
        if room.current_occupancy >= room.capacity:
            room.status = 'Occupied'
        room.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def hostel_allotment_detail(request, pk):
    try:
        allotment = HostelAllotment.objects.get(pk=pk)
    except HostelAllotment.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(HostelAllotmentSerializer(allotment).data)
    elif request.method == 'PATCH':
        s = HostelAllotmentSerializer(allotment, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    allotment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def hostel_complaint_list_create(request):
    if request.method == 'GET':
        qs = HostelComplaint.objects.select_related('student', 'hostel').all()
        hostel_id = request.query_params.get('hostel')
        st = request.query_params.get('status')
        if hostel_id:
            qs = qs.filter(hostel_id=hostel_id)
        if st:
            qs = qs.filter(status=st)
        return Response(HostelComplaintSerializer(qs, many=True).data)
    s = HostelComplaintSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def hostel_complaint_update(request, pk):
    try:
        complaint = HostelComplaint.objects.get(pk=pk)
    except HostelComplaint.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    s = HostelComplaintSerializer(complaint, data=request.data, partial=True)
    if s.is_valid():
        s.save()
        return Response(s.data)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hostel_stats(request):
    total_hostels = Hostel.objects.count()
    total_rooms = HostelRoom.objects.count()
    occupied = HostelRoom.objects.filter(status='Occupied').count()
    available = HostelRoom.objects.filter(status='Available').count()
    active_allotments = HostelAllotment.objects.filter(status='Active').count()
    open_complaints = HostelComplaint.objects.filter(status__in=['Open', 'In Progress']).count()
    return Response({
        'total_hostels': total_hostels,
        'total_rooms': total_rooms,
        'occupied_rooms': occupied,
        'available_rooms': available,
        'active_allotments': active_allotments,
        'open_complaints': open_complaints,
    })


# ─────────────────────────────────────────────
# Transport Views
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def transport_route_list_create(request):
    if request.method == 'GET':
        return Response(TransportRouteSerializer(TransportRoute.objects.all(), many=True).data)
    s = TransportRouteSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def transport_route_detail(request, pk):
    try:
        route = TransportRoute.objects.get(pk=pk)
    except TransportRoute.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(TransportRouteSerializer(route).data)
    elif request.method in ('PUT', 'PATCH'):
        s = TransportRouteSerializer(route, data=request.data, partial=request.method == 'PATCH')
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    route.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def vehicle_list_create(request):
    if request.method == 'GET':
        qs = Vehicle.objects.select_related('route').all()
        st = request.query_params.get('status')
        if st:
            qs = qs.filter(status=st)
        return Response(VehicleSerializer(qs, many=True).data)
    s = VehicleSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def vehicle_detail(request, pk):
    try:
        vehicle = Vehicle.objects.get(pk=pk)
    except Vehicle.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(VehicleSerializer(vehicle).data)
    elif request.method in ('PUT', 'PATCH'):
        s = VehicleSerializer(vehicle, data=request.data, partial=request.method == 'PATCH')
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    vehicle.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def transport_pass_list_create(request):
    if request.method == 'GET':
        qs = TransportPass.objects.select_related('student', 'route').all()
        student_id = request.query_params.get('student')
        route_id = request.query_params.get('route')
        st = request.query_params.get('status')
        if student_id:
            qs = qs.filter(student_id=student_id)
        if route_id:
            qs = qs.filter(route_id=route_id)
        if st:
            qs = qs.filter(status=st)
        return Response(TransportPassSerializer(qs, many=True).data)
    s = TransportPassSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def transport_pass_detail(request, pk):
    try:
        tp = TransportPass.objects.get(pk=pk)
    except TransportPass.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(TransportPassSerializer(tp).data)
    elif request.method == 'PATCH':
        s = TransportPassSerializer(tp, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    tp.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transport_stats(request):
    return Response({
        'total_routes': TransportRoute.objects.filter(is_active=True).count(),
        'total_vehicles': Vehicle.objects.count(),
        'active_vehicles': Vehicle.objects.filter(status='Active').count(),
        'active_passes': TransportPass.objects.filter(status='Active').count(),
        'maintenance_vehicles': Vehicle.objects.filter(status='Maintenance').count(),
    })


# ─────────────────────────────────────────────
# Laboratory Views
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lab_list_create(request):
    if request.method == 'GET':
        qs = Laboratory.objects.select_related('lab_incharge').all()
        dept = request.query_params.get('department')
        st = request.query_params.get('status')
        if dept:
            qs = qs.filter(department=dept)
        if st:
            qs = qs.filter(status=st)
        return Response(LaboratorySerializer(qs, many=True).data)
    s = LaboratorySerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def lab_detail(request, pk):
    try:
        lab = Laboratory.objects.get(pk=pk)
    except Laboratory.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(LaboratorySerializer(lab).data)
    elif request.method in ('PUT', 'PATCH'):
        s = LaboratorySerializer(lab, data=request.data, partial=request.method == 'PATCH')
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    lab.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lab_equipment_list_create(request):
    if request.method == 'GET':
        qs = LabEquipment.objects.select_related('lab').all()
        lab_id = request.query_params.get('lab')
        st = request.query_params.get('status')
        if lab_id:
            qs = qs.filter(lab_id=lab_id)
        if st:
            qs = qs.filter(status=st)
        return Response(LabEquipmentSerializer(qs, many=True).data)
    s = LabEquipmentSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def lab_equipment_detail(request, pk):
    try:
        eq = LabEquipment.objects.get(pk=pk)
    except LabEquipment.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(LabEquipmentSerializer(eq).data)
    elif request.method in ('PUT', 'PATCH'):
        s = LabEquipmentSerializer(eq, data=request.data, partial=request.method == 'PATCH')
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    eq.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lab_booking_list_create(request):
    if request.method == 'GET':
        qs = LabBooking.objects.select_related('lab', 'booked_by', 'course').all()
        lab_id = request.query_params.get('lab')
        st = request.query_params.get('status')
        date_filter = request.query_params.get('date')
        if lab_id:
            qs = qs.filter(lab_id=lab_id)
        if st:
            qs = qs.filter(status=st)
        if date_filter:
            qs = qs.filter(booking_date=date_filter)
        return Response(LabBookingSerializer(qs, many=True).data)
    s = LabBookingSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def lab_booking_detail(request, pk):
    try:
        booking = LabBooking.objects.get(pk=pk)
    except LabBooking.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(LabBookingSerializer(booking).data)
    elif request.method == 'PATCH':
        s = LabBookingSerializer(booking, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    booking.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lab_stats(request):
    return Response({
        'total_labs': Laboratory.objects.count(),
        'available_labs': Laboratory.objects.filter(status='Available').count(),
        'total_equipment': LabEquipment.objects.aggregate(total=Sum('quantity'))['total'] or 0,
        'faulty_equipment': LabEquipment.objects.filter(status='Faulty').count(),
        'pending_bookings': LabBooking.objects.filter(status='Pending').count(),
        'approved_bookings': LabBooking.objects.filter(status='Approved').count(),
    })


# ─────────────────────────────────────────────
# Cafeteria Views
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def cafeteria_menu_list_create(request):
    if request.method == 'GET':
        qs = CafeteriaMenu.objects.all()
        category = request.query_params.get('category')
        available = request.query_params.get('available')
        if category:
            qs = qs.filter(category=category)
        if available:
            qs = qs.filter(is_available=available == 'true')
        return Response(CafeteriaMenuSerializer(qs, many=True).data)
    s = CafeteriaMenuSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def cafeteria_menu_detail(request, pk):
    try:
        item = CafeteriaMenu.objects.get(pk=pk)
    except CafeteriaMenu.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(CafeteriaMenuSerializer(item).data)
    elif request.method in ('PUT', 'PATCH'):
        s = CafeteriaMenuSerializer(item, data=request.data, partial=request.method == 'PATCH')
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    item.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def cafeteria_order_list_create(request):
    if request.method == 'GET':
        qs = CafeteriaOrder.objects.select_related('student').prefetch_related('items__menu_item').all()
        student_id = request.query_params.get('student')
        st = request.query_params.get('status')
        date_filter = request.query_params.get('date')
        if student_id:
            qs = qs.filter(student_id=student_id)
        if st:
            qs = qs.filter(status=st)
        if date_filter:
            qs = qs.filter(order_date__date=date_filter)
        return Response(CafeteriaOrderSerializer(qs, many=True).data)
    s = CafeteriaOrderSerializer(data=request.data)
    if s.is_valid():
        order = s.save()
        return Response(CafeteriaOrderSerializer(order).data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def cafeteria_order_detail(request, pk):
    try:
        order = CafeteriaOrder.objects.get(pk=pk)
    except CafeteriaOrder.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(CafeteriaOrderSerializer(order).data)
    s = CafeteriaOrderSerializer(order, data=request.data, partial=True)
    if s.is_valid():
        s.save()
        return Response(s.data)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cafeteria_stats(request):
    from django.utils import timezone as tz
    today = tz.now().date()
    total_revenue = CafeteriaOrder.objects.filter(
        status='Delivered', payment_status='Paid'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    today_orders = CafeteriaOrder.objects.filter(order_date__date=today).count()
    today_revenue = CafeteriaOrder.objects.filter(
        order_date__date=today, payment_status='Paid'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    popular_items = (
        CafeteriaOrderItem.objects.values('menu_item__name')
        .annotate(total_qty=Sum('quantity'))
        .order_by('-total_qty')[:5]
    )
    return Response({
        'total_revenue': total_revenue,
        'today_orders': today_orders,
        'today_revenue': today_revenue,
        'pending_orders': CafeteriaOrder.objects.filter(status='Pending').count(),
        'total_menu_items': CafeteriaMenu.objects.filter(is_available=True).count(),
        'popular_items': list(popular_items),
    })


# ─────────────────────────────────────────────
# Placement Views
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def company_list_create(request):
    if request.method == 'GET':
        qs = Company.objects.all()
        search = request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(industry__icontains=search))
        return Response(CompanySerializer(qs, many=True).data)
    s = CompanySerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def company_detail(request, pk):
    try:
        company = Company.objects.get(pk=pk)
    except Company.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(CompanySerializer(company).data)
    elif request.method in ('PUT', 'PATCH'):
        s = CompanySerializer(company, data=request.data, partial=request.method == 'PATCH')
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    company.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def drive_list_create(request):
    if request.method == 'GET':
        qs = PlacementDrive.objects.select_related('company').all()
        st = request.query_params.get('status')
        job_type = request.query_params.get('job_type')
        if st:
            qs = qs.filter(status=st)
        if job_type:
            qs = qs.filter(job_type=job_type)
        return Response(PlacementDriveSerializer(qs, many=True).data)
    s = PlacementDriveSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def drive_detail(request, pk):
    try:
        drive = PlacementDrive.objects.get(pk=pk)
    except PlacementDrive.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(PlacementDriveSerializer(drive).data)
    elif request.method in ('PUT', 'PATCH'):
        s = PlacementDriveSerializer(drive, data=request.data, partial=request.method == 'PATCH')
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    drive.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def application_list_create(request):
    if request.method == 'GET':
        qs = PlacementApplication.objects.select_related('student', 'drive', 'drive__company').all()
        drive_id = request.query_params.get('drive')
        student_id = request.query_params.get('student')
        st = request.query_params.get('status')
        if drive_id:
            qs = qs.filter(drive_id=drive_id)
        if student_id:
            qs = qs.filter(student_id=student_id)
        if st:
            qs = qs.filter(status=st)
        return Response(PlacementApplicationSerializer(qs, many=True).data)
    s = PlacementApplicationSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def application_detail(request, pk):
    try:
        app = PlacementApplication.objects.get(pk=pk)
    except PlacementApplication.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(PlacementApplicationSerializer(app).data)
    elif request.method == 'PATCH':
        s = PlacementApplicationSerializer(app, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    app.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def interview_list_create(request):
    if request.method == 'GET':
        qs = InterviewSchedule.objects.select_related('application__student', 'application__drive__company').all()
        date_filter = request.query_params.get('date')
        if date_filter:
            qs = qs.filter(scheduled_date=date_filter)
        return Response(InterviewScheduleSerializer(qs, many=True).data)
    s = InterviewScheduleSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def interview_detail(request, pk):
    try:
        interview = InterviewSchedule.objects.get(pk=pk)
    except InterviewSchedule.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    s = InterviewScheduleSerializer(interview, data=request.data, partial=True)
    if s.is_valid():
        s.save()
        return Response(s.data)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def placement_stats(request):
    total_drives = PlacementDrive.objects.count()
    total_companies = Company.objects.count()
    total_placed = PlacementApplication.objects.filter(status__in=['Selected', 'Offer Accepted']).values('student').distinct().count()
    total_applications = PlacementApplication.objects.count()
    highest_package = PlacementDrive.objects.aggregate(max=models.Max('package_lpa'))['max'] or 0
    avg_package = PlacementDrive.objects.filter(package_lpa__gt=0).aggregate(avg=Avg('package_lpa'))['avg'] or 0
    by_dept = (
        PlacementApplication.objects.filter(status__in=['Selected', 'Offer Accepted'])
        .values('student__department')
        .annotate(count=Count('id'))
        .order_by('student__department')
    )
    return Response({
        'total_drives': total_drives,
        'total_companies': total_companies,
        'total_placed': total_placed,
        'total_applications': total_applications,
        'highest_package': float(highest_package),
        'avg_package': round(float(avg_package), 2),
        'placed_by_dept': list(by_dept),
    })


# ─────────────────────────────────────────────
# Sports Views
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def sport_list_create(request):
    if request.method == 'GET':
        qs = Sport.objects.all()
        cat = request.query_params.get('category')
        if cat:
            qs = qs.filter(category=cat)
        return Response(SportSerializer(qs, many=True).data)
    s = SportSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def sport_detail(request, pk):
    try:
        sport = Sport.objects.get(pk=pk)
    except Sport.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(SportSerializer(sport).data)
    elif request.method in ('PUT', 'PATCH'):
        s = SportSerializer(sport, data=request.data, partial=request.method == 'PATCH')
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    sport.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def tournament_list_create(request):
    if request.method == 'GET':
        qs = Tournament.objects.select_related('sport').all()
        st = request.query_params.get('status')
        sport_id = request.query_params.get('sport')
        if st:
            qs = qs.filter(status=st)
        if sport_id:
            qs = qs.filter(sport_id=sport_id)
        return Response(TournamentSerializer(qs, many=True).data)
    s = TournamentSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def tournament_detail(request, pk):
    try:
        t = Tournament.objects.get(pk=pk)
    except Tournament.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(TournamentSerializer(t).data)
    elif request.method in ('PUT', 'PATCH'):
        s = TournamentSerializer(t, data=request.data, partial=request.method == 'PATCH')
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    t.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def participation_list_create(request):
    if request.method == 'GET':
        qs = SportParticipation.objects.select_related('student', 'tournament__sport').all()
        tournament_id = request.query_params.get('tournament')
        student_id = request.query_params.get('student')
        if tournament_id:
            qs = qs.filter(tournament_id=tournament_id)
        if student_id:
            qs = qs.filter(student_id=student_id)
        return Response(SportParticipationSerializer(qs, many=True).data)
    s = SportParticipationSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def participation_detail(request, pk):
    try:
        p = SportParticipation.objects.get(pk=pk)
    except SportParticipation.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'PATCH':
        s = SportParticipationSerializer(p, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    p.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def achievement_list_create(request):
    if request.method == 'GET':
        qs = SportAchievement.objects.select_related('student', 'sport').all()
        level = request.query_params.get('level')
        sport_id = request.query_params.get('sport')
        if level:
            qs = qs.filter(level=level)
        if sport_id:
            qs = qs.filter(sport_id=sport_id)
        return Response(SportAchievementSerializer(qs, many=True).data)
    s = SportAchievementSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def achievement_detail(request, pk):
    try:
        a = SportAchievement.objects.get(pk=pk)
    except SportAchievement.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'PATCH':
        s = SportAchievementSerializer(a, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    a.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sports_stats(request):
    return Response({
        'total_sports': Sport.objects.filter(is_active=True).count(),
        'total_tournaments': Tournament.objects.count(),
        'ongoing_tournaments': Tournament.objects.filter(status='Ongoing').count(),
        'total_participations': SportParticipation.objects.count(),
        'total_achievements': SportAchievement.objects.count(),
        'national_achievements': SportAchievement.objects.filter(level__in=['National', 'International']).count(),
    })


# ─────────────────────────────────────────────
# Dashboard View
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    today = date.today()

    total_students = Student.objects.count()
    active_students = Student.objects.filter(status='Active').count()
    total_faculty = Faculty.objects.filter(status='Active').count()
    total_courses = Course.objects.filter(status='Active').count()
    total_books = Book.objects.aggregate(
        total=Sum('total_copies'), available=Sum('available_copies')
    )
    issued_books = BookIssue.objects.filter(status='Issued').count()
    overdue_books = BookIssue.objects.filter(status='Overdue').count()

    recent_enrollments = Enrollment.objects.select_related(
        'student', 'course'
    ).order_by('-enrolled_date')[:5]

    upcoming_exams = Exam.objects.filter(
        exam_date__gte=today, status='Scheduled'
    ).select_related('course').order_by('exam_date')[:5]

    fee_collected = FeePayment.objects.filter(
        status__in=['Paid', 'Partial']
    ).aggregate(total=Sum('amount_paid'))['total'] or 0

    dept_student_counts = (
        Student.objects.filter(status='Active')
        .values('department')
        .annotate(count=Count('id'))
        .order_by('department')
    )

    return Response({
        'total_students': total_students,
        'active_students': active_students,
        'total_faculty': total_faculty,
        'total_courses': total_courses,
        'total_books': total_books['total'] or 0,
        'available_books': total_books['available'] or 0,
        'issued_books': issued_books,
        'overdue_books': overdue_books,
        'fee_collected': fee_collected,
        'recent_enrollments': EnrollmentSerializer(recent_enrollments, many=True).data,
        'upcoming_exams': ExamSerializer(upcoming_exams, many=True).data,
        'students_by_department': list(dept_student_counts),
    })
