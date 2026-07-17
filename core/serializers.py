from rest_framework import serializers
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


class StudentSerializer(serializers.ModelSerializer):
    enrollments = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = [
            'id', 'roll_no', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'date_of_birth', 'gender', 'department',
            'semester', 'admission_year', 'address', 'blood_group',
            'guardian_name', 'guardian_phone', 'status',
            'created_at', 'updated_at', 'enrollments',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_enrollments(self, obj):
        enrollments = obj.enrollments.select_related('course').all()
        return EnrollmentSerializer(enrollments, many=True).data


class StudentListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = [
            'id', 'roll_no', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'department', 'semester', 'status',
        ]


class FacultySerializer(serializers.ModelSerializer):
    courses = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Faculty
        fields = [
            'id', 'employee_id', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'department', 'designation', 'qualification',
            'specialization', 'date_of_joining', 'salary', 'status',
            'created_at', 'updated_at', 'courses',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_courses(self, obj):
        courses = obj.courses.all()
        return CourseSerializer(courses, many=True).data


class FacultyListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Faculty
        fields = [
            'id', 'employee_id', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'department', 'designation', 'status',
        ]


class CourseSerializer(serializers.ModelSerializer):
    faculty_name = serializers.SerializerMethodField()
    enrolled_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'code', 'name', 'department', 'semester', 'credits',
            'theory_hours', 'practical_hours', 'max_strength',
            'faculty', 'faculty_name', 'enrolled_count', 'status',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_faculty_name(self, obj):
        if obj.faculty:
            return obj.faculty.full_name
        return None

    def get_enrolled_count(self, obj):
        return obj.enrollments.filter(status='Enrolled').count()


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_name', 'course', 'course_name',
            'enrolled_date', 'status',
        ]
        read_only_fields = ['id', 'enrolled_date']

    def get_student_name(self, obj):
        return obj.student.full_name

    def get_course_name(self, obj):
        return f"{obj.course.code} - {obj.course.name}"


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    marked_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'course', 'course_name',
            'date', 'status', 'remarks', 'marked_by', 'marked_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_student_name(self, obj):
        return obj.student.full_name

    def get_course_name(self, obj):
        return f"{obj.course.code} - {obj.course.name}"

    def get_marked_by_name(self, obj):
        if obj.marked_by:
            return obj.marked_by.full_name
        return None


class AttendanceMarkSerializer(serializers.Serializer):
    student = serializers.IntegerField()
    status = serializers.ChoiceField(choices=['Present', 'Absent', 'Late', 'Excused'])
    remarks = serializers.CharField(required=False, allow_blank=True, default='')


class BulkAttendanceSerializer(serializers.Serializer):
    course = serializers.IntegerField()
    date = serializers.DateField()
    marked_by = serializers.IntegerField(required=False, allow_null=True)
    attendances = AttendanceMarkSerializer(many=True)


class ExamSerializer(serializers.ModelSerializer):
    course_name = serializers.SerializerMethodField()
    grade_count = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            'id', 'name', 'course', 'course_name', 'exam_type',
            'max_marks', 'pass_marks', 'exam_date', 'start_time',
            'end_time', 'status', 'grade_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_course_name(self, obj):
        return f"{obj.course.code} - {obj.course.name}"

    def get_grade_count(self, obj):
        return obj.grades.count()


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    exam_name = serializers.SerializerMethodField()
    exam_type = serializers.SerializerMethodField()
    exam_max_marks = serializers.SerializerMethodField()
    exam_pass_marks = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()

    class Meta:
        model = Grade
        fields = [
            'id', 'student', 'student_name', 'exam', 'exam_name',
            'exam_type', 'exam_max_marks', 'exam_pass_marks', 'course_name',
            'marks_obtained', 'grade', 'remarks',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_student_name(self, obj): return obj.student.full_name
    def get_exam_name(self, obj): return obj.exam.name
    def get_exam_type(self, obj): return obj.exam.exam_type
    def get_exam_max_marks(self, obj): return obj.exam.max_marks
    def get_exam_pass_marks(self, obj): return obj.exam.pass_marks
    def get_course_name(self, obj): return f"{obj.exam.course.code} - {obj.exam.course.name}"


class GradeSubmitSerializer(serializers.Serializer):
    student = serializers.IntegerField()
    marks_obtained = serializers.DecimalField(max_digits=6, decimal_places=2)
    grade = serializers.CharField(max_length=5, required=False, allow_blank=True, default='')
    remarks = serializers.CharField(required=False, allow_blank=True, default='')


class BulkGradeSubmitSerializer(serializers.Serializer):
    exam = serializers.IntegerField()
    grades = GradeSubmitSerializer(many=True)


class FeeStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeStructure
        fields = [
            'id', 'department', 'semester', 'fee_type', 'amount',
            'academic_year', 'due_date', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class FeePaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    fee_type = serializers.SerializerMethodField()

    class Meta:
        model = FeePayment
        fields = [
            'id', 'student', 'student_name', 'structure', 'fee_type',
            'amount_paid', 'payment_date', 'payment_method',
            'transaction_id', 'receipt_no', 'status', 'remarks',
            'created_at',
        ]
        read_only_fields = ['id', 'payment_date', 'created_at']

    def get_student_name(self, obj):
        return obj.student.full_name

    def get_fee_type(self, obj):
        return obj.structure.fee_type


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'author', 'publisher', 'category',
            'edition', 'total_copies', 'available_copies', 'location',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BookIssueSerializer(serializers.ModelSerializer):
    book_title = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = BookIssue
        fields = [
            'id', 'book', 'book_title', 'student', 'student_name',
            'issue_date', 'due_date', 'return_date', 'status', 'fine',
            'created_at',
        ]
        read_only_fields = ['id', 'issue_date', 'created_at']

    def get_book_title(self, obj):
        return obj.book.title

    def get_student_name(self, obj):
        return obj.student.full_name


# ── Hostel Serializers ──

class HostelRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = HostelRoom
        fields = ['id','hostel','room_number','floor','room_type','capacity','current_occupancy','status','has_ac','has_attached_bath','monthly_rent','created_at']
        read_only_fields = ['id','created_at']


class HostelSerializer(serializers.ModelSerializer):
    occupied_rooms = serializers.ReadOnlyField()
    available_rooms = serializers.ReadOnlyField()
    rooms_count = serializers.SerializerMethodField()

    class Meta:
        model = Hostel
        fields = ['id','name','hostel_type','warden_name','warden_phone','warden_email','total_rooms','total_capacity','address','amenities','monthly_fee','occupied_rooms','available_rooms','rooms_count','created_at']
        read_only_fields = ['id','created_at']

    def get_rooms_count(self, obj):
        return obj.rooms.count()


class HostelAllotmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_roll = serializers.SerializerMethodField()
    room_number = serializers.SerializerMethodField()
    hostel_name = serializers.SerializerMethodField()

    class Meta:
        model = HostelAllotment
        fields = ['id','student','student_name','student_roll','room','room_number','hostel_name','allotment_date','vacating_date','status','remarks','created_at']
        read_only_fields = ['id','created_at']

    def get_student_name(self, obj): return obj.student.full_name
    def get_student_roll(self, obj): return obj.student.roll_no
    def get_room_number(self, obj): return obj.room.room_number
    def get_hostel_name(self, obj): return obj.room.hostel.name


class HostelComplaintSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    hostel_name = serializers.SerializerMethodField()

    class Meta:
        model = HostelComplaint
        fields = ['id','student','student_name','hostel','hostel_name','room','category','title','description','status','priority','resolved_at','resolution_note','created_at','updated_at']
        read_only_fields = ['id','created_at','updated_at']

    def get_student_name(self, obj): return obj.student.full_name
    def get_hostel_name(self, obj): return obj.hostel.name


# ── Transport Serializers ──

class TransportRouteSerializer(serializers.ModelSerializer):
    pass_count = serializers.SerializerMethodField()
    vehicle_count = serializers.SerializerMethodField()

    class Meta:
        model = TransportRoute
        fields = ['id','route_number','route_name','start_point','end_point','stops','distance_km','departure_time','arrival_time','monthly_fee','is_active','pass_count','vehicle_count','created_at']
        read_only_fields = ['id','created_at']

    def get_pass_count(self, obj): return obj.passes.filter(status='Active').count()
    def get_vehicle_count(self, obj): return obj.vehicles.count()


class VehicleSerializer(serializers.ModelSerializer):
    route_name = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = ['id','vehicle_number','vehicle_type','model','capacity','driver_name','driver_phone','driver_license','route','route_name','status','last_service_date','next_service_date','insurance_expiry','fitness_expiry','created_at']
        read_only_fields = ['id','created_at']

    def get_route_name(self, obj): return str(obj.route) if obj.route else None


class TransportPassSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_roll = serializers.SerializerMethodField()
    route_name = serializers.SerializerMethodField()

    class Meta:
        model = TransportPass
        fields = ['id','student','student_name','student_roll','route','route_name','pass_number','boarding_point','valid_from','valid_to','amount_paid','payment_method','status','created_at']
        read_only_fields = ['id','created_at']

    def get_student_name(self, obj): return obj.student.full_name
    def get_student_roll(self, obj): return obj.student.roll_no
    def get_route_name(self, obj): return str(obj.route)


# ── Laboratory Serializers ──

class LabEquipmentSerializer(serializers.ModelSerializer):
    lab_name = serializers.SerializerMethodField()

    class Meta:
        model = LabEquipment
        fields = ['id','lab','lab_name','name','equipment_id','brand','model','quantity','working_count','purchase_date','purchase_cost','status','last_maintenance','next_maintenance','remarks','created_at']
        read_only_fields = ['id','created_at']

    def get_lab_name(self, obj): return obj.lab.name


class LaboratorySerializer(serializers.ModelSerializer):
    incharge_name = serializers.SerializerMethodField()
    equipment_count = serializers.SerializerMethodField()
    upcoming_bookings = serializers.SerializerMethodField()

    class Meta:
        model = Laboratory
        fields = ['id','name','lab_code','department','location','capacity','lab_incharge','incharge_name','status','description','specialization','equipment_count','upcoming_bookings','created_at','updated_at']
        read_only_fields = ['id','created_at','updated_at']

    def get_incharge_name(self, obj): return obj.lab_incharge.full_name if obj.lab_incharge else None
    def get_equipment_count(self, obj): return obj.equipment.count()
    def get_upcoming_bookings(self, obj): return obj.bookings.filter(status='Approved').count()


class LabBookingSerializer(serializers.ModelSerializer):
    lab_name = serializers.SerializerMethodField()
    faculty_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()

    class Meta:
        model = LabBooking
        fields = ['id','lab','lab_name','booked_by','faculty_name','course','course_name','booking_date','start_time','end_time','purpose','student_count','status','approved_by','rejection_reason','created_at','updated_at']
        read_only_fields = ['id','created_at','updated_at']

    def get_lab_name(self, obj): return obj.lab.name
    def get_faculty_name(self, obj): return obj.booked_by.full_name
    def get_course_name(self, obj): return str(obj.course) if obj.course else None


# ── Cafeteria Serializers ──

class CafeteriaMenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = CafeteriaMenu
        fields = ['id','name','category','description','price','is_available','is_veg','calories','preparation_time','image_url','created_at','updated_at']
        read_only_fields = ['id','created_at','updated_at']


class CafeteriaOrderItemSerializer(serializers.ModelSerializer):
    item_name = serializers.SerializerMethodField()
    class Meta:
        model = CafeteriaOrderItem
        fields = ['id','menu_item','item_name','quantity','unit_price','subtotal']
    def get_item_name(self, obj): return obj.menu_item.name


class CafeteriaOrderItemCreateSerializer(serializers.Serializer):
    menu_item = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class CafeteriaOrderSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_roll = serializers.SerializerMethodField()
    items = CafeteriaOrderItemSerializer(many=True, read_only=True)
    order_items = CafeteriaOrderItemCreateSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = CafeteriaOrder
        fields = ['id','student','student_name','student_roll','order_number','order_date','total_amount','status','payment_method','payment_status','special_instructions','estimated_ready_time','items','order_items','created_at']
        read_only_fields = ['id','order_date','total_amount','created_at']

    def get_student_name(self, obj): return obj.student.full_name
    def get_student_roll(self, obj): return obj.student.roll_no

    def create(self, validated_data):
        order_items_data = validated_data.pop('order_items', [])
        order = CafeteriaOrder.objects.create(**validated_data)
        total = 0
        for item_data in order_items_data:
            menu_item = CafeteriaMenu.objects.get(pk=item_data['menu_item'])
            qty = item_data['quantity']
            subtotal = menu_item.price * qty
            CafeteriaOrderItem.objects.create(
                order=order, menu_item=menu_item,
                quantity=qty, unit_price=menu_item.price, subtotal=subtotal
            )
            total += subtotal
        order.total_amount = total
        order.save()
        return order


# ── Placement Serializers ──

class CompanySerializer(serializers.ModelSerializer):
    drives_count = serializers.SerializerMethodField()
    class Meta:
        model = Company
        fields = ['id','name','industry','website','contact_person','contact_email','contact_phone','description','logo_url','drives_count','created_at']
        read_only_fields = ['id','created_at']
    def get_drives_count(self, obj): return obj.drives.count()


class PlacementDriveSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()
    company_industry = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()
    selected_count = serializers.SerializerMethodField()
    class Meta:
        model = PlacementDrive
        fields = ['id','company','company_name','company_industry','title','job_role','job_type','package_lpa','stipend_monthly','eligible_departments','min_cgpa','max_backlogs','drive_date','last_apply_date','venue','description','status','total_openings','applications_count','selected_count','created_at','updated_at']
        read_only_fields = ['id','created_at','updated_at']
    def get_company_name(self, obj): return obj.company.name
    def get_company_industry(self, obj): return obj.company.industry
    def get_applications_count(self, obj): return obj.applications.count()
    def get_selected_count(self, obj): return obj.applications.filter(status__in=['Selected','Offer Accepted']).count()


class PlacementApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_roll = serializers.SerializerMethodField()
    student_dept = serializers.SerializerMethodField()
    drive_title = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    class Meta:
        model = PlacementApplication
        fields = ['id','student','student_name','student_roll','student_dept','drive','drive_title','company_name','applied_date','status','resume_url','package_offered','offer_date','remarks','created_at','updated_at']
        read_only_fields = ['id','applied_date','created_at','updated_at']
    def get_student_name(self, obj): return obj.student.full_name
    def get_student_roll(self, obj): return obj.student.roll_no
    def get_student_dept(self, obj): return obj.student.department
    def get_drive_title(self, obj): return obj.drive.job_role
    def get_company_name(self, obj): return obj.drive.company.name


class InterviewScheduleSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    class Meta:
        model = InterviewSchedule
        fields = ['id','application','student_name','company_name','interview_type','scheduled_date','scheduled_time','venue','interviewer','result','feedback','created_at']
        read_only_fields = ['id','created_at']
    def get_student_name(self, obj): return obj.application.student.full_name
    def get_company_name(self, obj): return obj.application.drive.company.name


# ── Sports Serializers ──

class SportSerializer(serializers.ModelSerializer):
    tournaments_count = serializers.SerializerMethodField()
    class Meta:
        model = Sport
        fields = ['id','name','category','description','coach_name','coach_phone','venue','max_team_size','is_active','tournaments_count','created_at']
        read_only_fields = ['id','created_at']
    def get_tournaments_count(self, obj): return obj.tournaments.count()


class TournamentSerializer(serializers.ModelSerializer):
    sport_name = serializers.SerializerMethodField()
    sport_category = serializers.SerializerMethodField()
    participants_count = serializers.SerializerMethodField()
    class Meta:
        model = Tournament
        fields = ['id','name','sport','sport_name','sport_category','tournament_type','start_date','end_date','venue','organizer','prize_pool','description','status','participants_count','created_at','updated_at']
        read_only_fields = ['id','created_at','updated_at']
    def get_sport_name(self, obj): return obj.sport.name
    def get_sport_category(self, obj): return obj.sport.category
    def get_participants_count(self, obj): return obj.participations.count()


class SportParticipationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_roll = serializers.SerializerMethodField()
    tournament_name = serializers.SerializerMethodField()
    sport_name = serializers.SerializerMethodField()
    class Meta:
        model = SportParticipation
        fields = ['id','student','student_name','student_roll','tournament','tournament_name','sport_name','position','status','team_name','remarks','created_at']
        read_only_fields = ['id','created_at']
    def get_student_name(self, obj): return obj.student.full_name
    def get_student_roll(self, obj): return obj.student.roll_no
    def get_tournament_name(self, obj): return obj.tournament.name
    def get_sport_name(self, obj): return obj.tournament.sport.name


class SportAchievementSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_roll = serializers.SerializerMethodField()
    sport_name = serializers.SerializerMethodField()
    class Meta:
        model = SportAchievement
        fields = ['id','student','student_name','student_roll','sport','sport_name','title','level','position','event_name','achievement_date','certificate_url','description','created_at']
        read_only_fields = ['id','created_at']
    def get_student_name(self, obj): return obj.student.full_name
    def get_student_roll(self, obj): return obj.student.roll_no
    def get_sport_name(self, obj): return obj.sport.name
