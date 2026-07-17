from django.db import models
from django.conf import settings


DEPARTMENT_CHOICES = (
    ('CSE', 'Computer Science & Engineering'),
    ('ECE', 'Electronics & Communication Engineering'),
    ('EEE', 'Electrical & Electronics Engineering'),
    ('ME', 'Mechanical Engineering'),
    ('CE', 'Civil Engineering'),
    ('IT', 'Information Technology'),
)

GENDER_CHOICES = (
    ('M', 'Male'),
    ('F', 'Female'),
    ('O', 'Other'),
)

STATUS_CHOICES_STUDENT = (
    ('Active', 'Active'),
    ('Inactive', 'Inactive'),
    ('Graduated', 'Graduated'),
    ('Suspended', 'Suspended'),
)

STATUS_CHOICES_FACULTY = (
    ('Active', 'Active'),
    ('Inactive', 'Inactive'),
    ('On Leave', 'On Leave'),
)

STATUS_CHOICES_COURSE = (
    ('Active', 'Active'),
    ('Inactive', 'Inactive'),
    ('Completed', 'Completed'),
)

ENROLLMENT_STATUS = (
    ('Enrolled', 'Enrolled'),
    ('Dropped', 'Dropped'),
    ('Completed', 'Completed'),
)

ATTENDANCE_STATUS = (
    ('Present', 'Present'),
    ('Absent', 'Absent'),
    ('Late', 'Late'),
    ('Excused', 'Excused'),
)

EXAM_TYPE_CHOICES = (
    ('Internal', 'Internal'),
    ('Mid-Semester', 'Mid-Semester'),
    ('End-Semester', 'End-Semester'),
    ('Practical', 'Practical'),
    ('Assignment', 'Assignment'),
)

EXAM_STATUS_CHOICES = (
    ('Scheduled', 'Scheduled'),
    ('Ongoing', 'Ongoing'),
    ('Completed', 'Completed'),
    ('Cancelled', 'Cancelled'),
)

PAYMENT_METHOD_CHOICES = (
    ('Cash', 'Cash'),
    ('Card', 'Card'),
    ('Online', 'Online'),
    ('Cheque', 'Cheque'),
    ('DD', 'Demand Draft'),
)

FEE_STATUS_CHOICES = (
    ('Paid', 'Paid'),
    ('Partial', 'Partial'),
    ('Pending', 'Pending'),
    ('Refunded', 'Refunded'),
)

BOOK_ISSUE_STATUS = (
    ('Issued', 'Issued'),
    ('Returned', 'Returned'),
    ('Overdue', 'Overdue'),
)

BOOK_CATEGORY_CHOICES = (
    ('Textbook', 'Textbook'),
    ('Reference', 'Reference'),
    ('Journal', 'Journal'),
    ('Magazine', 'Magazine'),
    ('Novel', 'Novel'),
    ('Other', 'Other'),
)

# ── Hostel ──
HOSTEL_TYPE_CHOICES = (
    ('Boys', 'Boys Hostel'),
    ('Girls', 'Girls Hostel'),
    ('Mixed', 'Mixed Hostel'),
)

ROOM_TYPE_CHOICES = (
    ('Single', 'Single Occupancy'),
    ('Double', 'Double Occupancy'),
    ('Triple', 'Triple Occupancy'),
    ('Dormitory', 'Dormitory'),
)

ROOM_STATUS_CHOICES = (
    ('Available', 'Available'),
    ('Occupied', 'Occupied'),
    ('Maintenance', 'Under Maintenance'),
    ('Reserved', 'Reserved'),
)

ALLOTMENT_STATUS_CHOICES = (
    ('Active', 'Active'),
    ('Vacated', 'Vacated'),
    ('Suspended', 'Suspended'),
)

COMPLAINT_STATUS_CHOICES = (
    ('Open', 'Open'),
    ('In Progress', 'In Progress'),
    ('Resolved', 'Resolved'),
    ('Closed', 'Closed'),
)

COMPLAINT_CATEGORY_CHOICES = (
    ('Electrical', 'Electrical'),
    ('Plumbing', 'Plumbing'),
    ('Furniture', 'Furniture'),
    ('Cleanliness', 'Cleanliness'),
    ('Security', 'Security'),
    ('Internet', 'Internet'),
    ('Other', 'Other'),
)

# ── Transport ──
VEHICLE_TYPE_CHOICES = (
    ('Bus', 'Bus'),
    ('Mini Bus', 'Mini Bus'),
    ('Van', 'Van'),
)

VEHICLE_STATUS_CHOICES = (
    ('Active', 'Active'),
    ('Maintenance', 'Under Maintenance'),
    ('Inactive', 'Inactive'),
)

PASS_STATUS_CHOICES = (
    ('Active', 'Active'),
    ('Expired', 'Expired'),
    ('Cancelled', 'Cancelled'),
)

# ── Laboratory ──
LAB_STATUS_CHOICES = (
    ('Available', 'Available'),
    ('Occupied', 'Occupied'),
    ('Maintenance', 'Under Maintenance'),
)

EQUIPMENT_STATUS_CHOICES = (
    ('Working', 'Working'),
    ('Faulty', 'Faulty'),
    ('Under Repair', 'Under Repair'),
    ('Condemned', 'Condemned'),
)

BOOKING_STATUS_CHOICES = (
    ('Pending', 'Pending'),
    ('Approved', 'Approved'),
    ('Rejected', 'Rejected'),
    ('Completed', 'Completed'),
    ('Cancelled', 'Cancelled'),
)

# ── Cafeteria ──
MENU_CATEGORY_CHOICES = (
    ('Breakfast', 'Breakfast'),
    ('Lunch', 'Lunch'),
    ('Snacks', 'Snacks'),
    ('Dinner', 'Dinner'),
    ('Beverages', 'Beverages'),
    ('Desserts', 'Desserts'),
)

ORDER_STATUS_CHOICES = (
    ('Pending', 'Pending'),
    ('Preparing', 'Preparing'),
    ('Ready', 'Ready'),
    ('Delivered', 'Delivered'),
    ('Cancelled', 'Cancelled'),
)

PAYMENT_STATUS_CHOICES = (
    ('Paid', 'Paid'),
    ('Unpaid', 'Unpaid'),
    ('Refunded', 'Refunded'),
)


class Student(models.Model):
    roll_no = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    department = models.CharField(max_length=10, choices=DEPARTMENT_CHOICES)
    semester = models.PositiveIntegerField(default=1)
    admission_year = models.PositiveIntegerField(default=2024)
    address = models.TextField(blank=True)
    blood_group = models.CharField(max_length=5, blank=True)
    guardian_name = models.CharField(max_length=200, blank=True)
    guardian_phone = models.CharField(max_length=15, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES_STUDENT, default='Active'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'
        ordering = ['department', 'roll_no']

    def __str__(self):
        return f"{self.roll_no} - {self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Faculty(models.Model):
    employee_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    department = models.CharField(max_length=10, choices=DEPARTMENT_CHOICES)
    designation = models.CharField(max_length=100, blank=True)
    qualification = models.CharField(max_length=200, blank=True)
    specialization = models.CharField(max_length=200, blank=True)
    date_of_joining = models.DateField(null=True, blank=True)
    salary = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES_FACULTY, default='Active'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'faculty'
        ordering = ['department', 'employee_id']

    def __str__(self):
        return f"{self.employee_id} - {self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Course(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    department = models.CharField(max_length=10, choices=DEPARTMENT_CHOICES)
    semester = models.PositiveIntegerField(default=1)
    credits = models.PositiveIntegerField(default=3)
    theory_hours = models.PositiveIntegerField(default=3)
    practical_hours = models.PositiveIntegerField(default=1)
    max_strength = models.PositiveIntegerField(default=60)
    faculty = models.ForeignKey(
        Faculty, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='courses'
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES_COURSE, default='Active'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['department', 'semester', 'code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class Enrollment(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='enrollments'
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='enrollments'
    )
    enrolled_date = models.DateField(auto_now_add=True)
    status = models.CharField(
        max_length=20, choices=ENROLLMENT_STATUS, default='Enrolled'
    )

    class Meta:
        db_table = 'enrollments'
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.roll_no} - {self.course.code}"


class Attendance(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='attendances'
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='attendances'
    )
    date = models.DateField()
    status = models.CharField(max_length=10, choices=ATTENDANCE_STATUS)
    remarks = models.CharField(max_length=200, blank=True)
    marked_by = models.ForeignKey(
        Faculty, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='marked_attendances'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attendances'
        unique_together = ('student', 'course', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.student.roll_no} - {self.course.code} - {self.date} ({self.status})"


class Exam(models.Model):
    name = models.CharField(max_length=200)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='exams'
    )
    exam_type = models.CharField(max_length=20, choices=EXAM_TYPE_CHOICES)
    max_marks = models.PositiveIntegerField(default=100)
    pass_marks = models.PositiveIntegerField(default=40)
    exam_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=EXAM_STATUS_CHOICES, default='Scheduled'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'exams'
        ordering = ['-exam_date']

    def __str__(self):
        return f"{self.name} ({self.get_exam_type_display()})"


class Grade(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='grades'
    )
    exam = models.ForeignKey(
        Exam, on_delete=models.CASCADE, related_name='grades'
    )
    marks_obtained = models.DecimalField(
        max_digits=6, decimal_places=2, default=0
    )
    grade = models.CharField(max_length=5, blank=True)
    remarks = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'grades'
        unique_together = ('student', 'exam')

    def __str__(self):
        return f"{self.student.roll_no} - {self.exam.name} ({self.marks_obtained})"


class FeeStructure(models.Model):
    department = models.CharField(max_length=10, choices=DEPARTMENT_CHOICES)
    semester = models.PositiveIntegerField()
    fee_type = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    academic_year = models.CharField(max_length=10, default='2024-25')
    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fee_structures'
        verbose_name_plural = 'Fee Structures'

    def __str__(self):
        return f"{self.department} Sem {self.semester} - {self.fee_type}"


class FeePayment(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='fee_payments'
    )
    structure = models.ForeignKey(
        FeeStructure, on_delete=models.CASCADE, related_name='payments'
    )
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    payment_method = models.CharField(
        max_length=10, choices=PAYMENT_METHOD_CHOICES, default='Online'
    )
    transaction_id = models.CharField(max_length=100, blank=True)
    receipt_no = models.CharField(max_length=50, blank=True)
    status = models.CharField(
        max_length=20, choices=FEE_STATUS_CHOICES, default='Pending'
    )
    remarks = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fee_payments'

    def __str__(self):
        return f"{self.student.roll_no} - {self.structure.fee_type} ({self.amount_paid})"


class Book(models.Model):
    isbn = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=300)
    author = models.CharField(max_length=200)
    publisher = models.CharField(max_length=200, blank=True)
    category = models.CharField(
        max_length=20, choices=BOOK_CATEGORY_CHOICES, default='Textbook'
    )
    edition = models.CharField(max_length=50, blank=True)
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    location = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'books'
        ordering = ['title']

    def __str__(self):
        return f"{self.title} by {self.author}"


class BookIssue(models.Model):
    book = models.ForeignKey(
        Book, on_delete=models.CASCADE, related_name='issues'
    )
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='book_issues'
    )
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=BOOK_ISSUE_STATUS, default='Issued'
    )
    fine = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'book_issues'
        ordering = ['-issue_date']

    def __str__(self):
        return f"{self.book.title} -> {self.student.roll_no}"


# ═══════════════════════════════════════════
# HOSTEL MODELS
# ═══════════════════════════════════════════

class Hostel(models.Model):
    name = models.CharField(max_length=200)
    hostel_type = models.CharField(max_length=10, choices=HOSTEL_TYPE_CHOICES)
    warden_name = models.CharField(max_length=200, blank=True)
    warden_phone = models.CharField(max_length=15, blank=True)
    warden_email = models.EmailField(blank=True)
    total_rooms = models.PositiveIntegerField(default=0)
    total_capacity = models.PositiveIntegerField(default=0)
    address = models.TextField(blank=True)
    amenities = models.TextField(blank=True, help_text='Comma separated amenities')
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hostels'

    def __str__(self):
        return self.name

    @property
    def occupied_rooms(self):
        return self.rooms.filter(status='Occupied').count()

    @property
    def available_rooms(self):
        return self.rooms.filter(status='Available').count()


class HostelRoom(models.Model):
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='rooms')
    room_number = models.CharField(max_length=20)
    floor = models.PositiveIntegerField(default=1)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES)
    capacity = models.PositiveIntegerField(default=1)
    current_occupancy = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=ROOM_STATUS_CHOICES, default='Available')
    has_ac = models.BooleanField(default=False)
    has_attached_bath = models.BooleanField(default=False)
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hostel_rooms'
        unique_together = ('hostel', 'room_number')
        ordering = ['hostel', 'floor', 'room_number']

    def __str__(self):
        return f"{self.hostel.name} - Room {self.room_number}"


class HostelAllotment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='hostel_allotments')
    room = models.ForeignKey(HostelRoom, on_delete=models.CASCADE, related_name='allotments')
    allotment_date = models.DateField()
    vacating_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=ALLOTMENT_STATUS_CHOICES, default='Active')
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hostel_allotments'
        ordering = ['-allotment_date']

    def __str__(self):
        return f"{self.student.roll_no} - {self.room}"


class HostelComplaint(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='hostel_complaints')
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='complaints')
    room = models.ForeignKey(HostelRoom, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints')
    category = models.CharField(max_length=20, choices=COMPLAINT_CATEGORY_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=COMPLAINT_STATUS_CHOICES, default='Open')
    priority = models.CharField(max_length=10, choices=(('Low','Low'),('Medium','Medium'),('High','High'),('Urgent','Urgent')), default='Medium')
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hostel_complaints'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.student.roll_no}"


# ═══════════════════════════════════════════
# TRANSPORT MODELS
# ═══════════════════════════════════════════

class TransportRoute(models.Model):
    route_number = models.CharField(max_length=20, unique=True)
    route_name = models.CharField(max_length=200)
    start_point = models.CharField(max_length=200)
    end_point = models.CharField(max_length=200)
    stops = models.TextField(blank=True, help_text='Comma separated stops')
    distance_km = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    departure_time = models.TimeField()
    arrival_time = models.TimeField()
    monthly_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transport_routes'
        ordering = ['route_number']

    def __str__(self):
        return f"Route {self.route_number} - {self.route_name}"


class Vehicle(models.Model):
    vehicle_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)
    model = models.CharField(max_length=100, blank=True)
    capacity = models.PositiveIntegerField(default=40)
    driver_name = models.CharField(max_length=200, blank=True)
    driver_phone = models.CharField(max_length=15, blank=True)
    driver_license = models.CharField(max_length=50, blank=True)
    route = models.ForeignKey(TransportRoute, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicles')
    status = models.CharField(max_length=20, choices=VEHICLE_STATUS_CHOICES, default='Active')
    last_service_date = models.DateField(null=True, blank=True)
    next_service_date = models.DateField(null=True, blank=True)
    insurance_expiry = models.DateField(null=True, blank=True)
    fitness_expiry = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicles'
        ordering = ['vehicle_number']

    def __str__(self):
        return f"{self.vehicle_number} ({self.vehicle_type})"


class TransportPass(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='transport_passes')
    route = models.ForeignKey(TransportRoute, on_delete=models.CASCADE, related_name='passes')
    pass_number = models.CharField(max_length=50, unique=True)
    boarding_point = models.CharField(max_length=200)
    valid_from = models.DateField()
    valid_to = models.DateField()
    amount_paid = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='Online')
    status = models.CharField(max_length=20, choices=PASS_STATUS_CHOICES, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transport_passes'
        ordering = ['-valid_from']

    def __str__(self):
        return f"{self.pass_number} - {self.student.roll_no}"


# ═══════════════════════════════════════════
# LABORATORY MODELS
# ═══════════════════════════════════════════

class Laboratory(models.Model):
    name = models.CharField(max_length=200)
    lab_code = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=10, choices=DEPARTMENT_CHOICES)
    location = models.CharField(max_length=200, blank=True)
    capacity = models.PositiveIntegerField(default=30)
    lab_incharge = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True, blank=True, related_name='labs_incharge')
    status = models.CharField(max_length=20, choices=LAB_STATUS_CHOICES, default='Available')
    description = models.TextField(blank=True)
    specialization = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'laboratories'
        ordering = ['department', 'lab_code']

    def __str__(self):
        return f"{self.lab_code} - {self.name}"


class LabEquipment(models.Model):
    lab = models.ForeignKey(Laboratory, on_delete=models.CASCADE, related_name='equipment')
    name = models.CharField(max_length=200)
    equipment_id = models.CharField(max_length=50, unique=True)
    brand = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    working_count = models.PositiveIntegerField(default=1)
    purchase_date = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=EQUIPMENT_STATUS_CHOICES, default='Working')
    last_maintenance = models.DateField(null=True, blank=True)
    next_maintenance = models.DateField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lab_equipment'
        ordering = ['lab', 'name']

    def __str__(self):
        return f"{self.equipment_id} - {self.name}"


class LabBooking(models.Model):
    lab = models.ForeignKey(Laboratory, on_delete=models.CASCADE, related_name='bookings')
    booked_by = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='lab_bookings')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='lab_bookings')
    booking_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    purpose = models.CharField(max_length=300)
    student_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=BOOKING_STATUS_CHOICES, default='Pending')
    approved_by = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_bookings')
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lab_bookings'
        ordering = ['-booking_date', 'start_time']

    def __str__(self):
        return f"{self.lab.name} - {self.booking_date} {self.start_time}"


# ═══════════════════════════════════════════════
# CAFETERIA MODELS
# ═══════════════════════════════════════════════

class CafeteriaMenu(models.Model):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=MENU_CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_available = models.BooleanField(default=True)
    is_veg = models.BooleanField(default=True)
    calories = models.PositiveIntegerField(default=0)
    preparation_time = models.PositiveIntegerField(default=10, help_text='Minutes')
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cafeteria_menu'
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.category})"


class CafeteriaOrder(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='cafeteria_orders')
    order_number = models.CharField(max_length=50, unique=True)
    order_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='Pending')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='Online')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='Unpaid')
    special_instructions = models.TextField(blank=True)
    estimated_ready_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cafeteria_orders'
        ordering = ['-order_date']

    def __str__(self):
        return f"Order #{self.order_number} - {self.student.roll_no}"


class CafeteriaOrderItem(models.Model):
    order = models.ForeignKey(CafeteriaOrder, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(CafeteriaMenu, on_delete=models.CASCADE, related_name='order_items')
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'cafeteria_order_items'

    def __str__(self):
        return f"{self.menu_item.name} x{self.quantity}"


# ═══════════════════════════════════════════════
# PLACEMENT MODELS
# ═══════════════════════════════════════════════

PLACEMENT_STATUS_CHOICES = (
    ('Upcoming', 'Upcoming'),
    ('Ongoing', 'Ongoing'),
    ('Completed', 'Completed'),
    ('Cancelled', 'Cancelled'),
)

APPLICATION_STATUS_CHOICES = (
    ('Applied', 'Applied'),
    ('Shortlisted', 'Shortlisted'),
    ('Interview Scheduled', 'Interview Scheduled'),
    ('Selected', 'Selected'),
    ('Rejected', 'Rejected'),
    ('Offer Accepted', 'Offer Accepted'),
    ('Offer Declined', 'Offer Declined'),
)

INTERVIEW_TYPE_CHOICES = (
    ('Technical', 'Technical'),
    ('HR', 'HR'),
    ('Group Discussion', 'Group Discussion'),
    ('Aptitude Test', 'Aptitude Test'),
    ('Final', 'Final Round'),
)


class Company(models.Model):
    name = models.CharField(max_length=200)
    industry = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    contact_person = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=15, blank=True)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'companies'
        ordering = ['name']

    def __str__(self):
        return self.name


class PlacementDrive(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='drives')
    title = models.CharField(max_length=200)
    job_role = models.CharField(max_length=200)
    job_type = models.CharField(max_length=50, choices=(('Full Time','Full Time'),('Internship','Internship'),('Part Time','Part Time')), default='Full Time')
    package_lpa = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    stipend_monthly = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    eligible_departments = models.CharField(max_length=200, blank=True, help_text='Comma separated dept codes')
    min_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    max_backlogs = models.PositiveIntegerField(default=0)
    drive_date = models.DateField()
    last_apply_date = models.DateField()
    venue = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=PLACEMENT_STATUS_CHOICES, default='Upcoming')
    total_openings = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'placement_drives'
        ordering = ['-drive_date']

    def __str__(self):
        return f"{self.company.name} - {self.job_role}"


class PlacementApplication(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='placement_applications')
    drive = models.ForeignKey(PlacementDrive, on_delete=models.CASCADE, related_name='applications')
    applied_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=30, choices=APPLICATION_STATUS_CHOICES, default='Applied')
    resume_url = models.URLField(blank=True)
    package_offered = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    offer_date = models.DateField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'placement_applications'
        unique_together = ('student', 'drive')
        ordering = ['-applied_date']

    def __str__(self):
        return f"{self.student.roll_no} - {self.drive.company.name}"


class InterviewSchedule(models.Model):
    application = models.ForeignKey(PlacementApplication, on_delete=models.CASCADE, related_name='interviews')
    interview_type = models.CharField(max_length=30, choices=INTERVIEW_TYPE_CHOICES)
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    venue = models.CharField(max_length=300, blank=True)
    interviewer = models.CharField(max_length=200, blank=True)
    result = models.CharField(max_length=20, choices=(('Pending','Pending'),('Passed','Passed'),('Failed','Failed')), default='Pending')
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'interview_schedules'
        ordering = ['scheduled_date', 'scheduled_time']

    def __str__(self):
        return f"{self.application.student.roll_no} - {self.interview_type} - {self.scheduled_date}"


# ═══════════════════════════════════════════════
# SPORTS MODELS
# ═══════════════════════════════════════════════

SPORT_CATEGORY_CHOICES = (
    ('Indoor', 'Indoor'),
    ('Outdoor', 'Outdoor'),
    ('Aquatic', 'Aquatic'),
    ('Combat', 'Combat'),
    ('Athletics', 'Athletics'),
)

TOURNAMENT_STATUS_CHOICES = (
    ('Upcoming', 'Upcoming'),
    ('Ongoing', 'Ongoing'),
    ('Completed', 'Completed'),
    ('Cancelled', 'Cancelled'),
)

PARTICIPATION_STATUS_CHOICES = (
    ('Registered', 'Registered'),
    ('Confirmed', 'Confirmed'),
    ('Withdrawn', 'Withdrawn'),
    ('Disqualified', 'Disqualified'),
)

ACHIEVEMENT_LEVEL_CHOICES = (
    ('College', 'College Level'),
    ('District', 'District Level'),
    ('State', 'State Level'),
    ('National', 'National Level'),
    ('International', 'International Level'),
)


class Sport(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=SPORT_CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    coach_name = models.CharField(max_length=200, blank=True)
    coach_phone = models.CharField(max_length=15, blank=True)
    venue = models.CharField(max_length=200, blank=True)
    max_team_size = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sports'
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.category})"


class Tournament(models.Model):
    name = models.CharField(max_length=200)
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE, related_name='tournaments')
    tournament_type = models.CharField(max_length=50, choices=(('Intra College','Intra College'),('Inter College','Inter College'),('District','District'),('State','State'),('National','National')), default='Intra College')
    start_date = models.DateField()
    end_date = models.DateField()
    venue = models.CharField(max_length=200, blank=True)
    organizer = models.CharField(max_length=200, blank=True)
    prize_pool = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=TOURNAMENT_STATUS_CHOICES, default='Upcoming')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tournaments'
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.name} - {self.sport.name}"


class SportParticipation(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='sport_participations')
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='participations')
    position = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=PARTICIPATION_STATUS_CHOICES, default='Registered')
    team_name = models.CharField(max_length=100, blank=True)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sport_participations'
        unique_together = ('student', 'tournament')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.roll_no} - {self.tournament.name}"


class SportAchievement(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='sport_achievements')
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=200)
    level = models.CharField(max_length=20, choices=ACHIEVEMENT_LEVEL_CHOICES)
    position = models.CharField(max_length=50, blank=True)
    event_name = models.CharField(max_length=200, blank=True)
    achievement_date = models.DateField()
    certificate_url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sport_achievements'
        ordering = ['-achievement_date']

    def __str__(self):
        return f"{self.student.roll_no} - {self.title}"
