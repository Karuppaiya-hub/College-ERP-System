import random
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

from core.models import (
    Student, Faculty, Course, Enrollment, Attendance,
    Exam, Grade, FeeStructure, FeePayment, Book, BookIssue,
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with sample data for College ERP'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        with transaction.atomic():
            self.create_faculty()
            self.create_students()
            self.create_courses()
            self.create_users()
            self.create_enrollments()
            self.create_fee_structures()
            self.create_fee_payments()
            self.create_library_books()
            self.create_book_issues()
            self.create_exams()
            self.create_attendance()

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))

    def create_faculty(self):
        faculty_data = [
            {
                'employee_id': 'FAC001',
                'first_name': 'Rajesh',
                'last_name': 'Kumar',
                'email': 'rajesh.kumar@college.edu',
                'phone': '9876543210',
                'department': 'CSE',
                'designation': 'Professor',
                'qualification': 'Ph.D. Computer Science',
                'specialization': 'Artificial Intelligence',
                'date_of_joining': date(2015, 7, 1),
                'salary': Decimal('85000'),
                'status': 'Active',
            },
            {
                'employee_id': 'FAC002',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'email': 'priya.sharma@college.edu',
                'phone': '9876543211',
                'department': 'ECE',
                'designation': 'Associate Professor',
                'qualification': 'Ph.D. Electronics',
                'specialization': 'VLSI Design',
                'date_of_joining': date(2017, 1, 15),
                'salary': Decimal('72000'),
                'status': 'Active',
            },
            {
                'employee_id': 'FAC003',
                'first_name': 'Anand',
                'last_name': 'Verma',
                'email': 'anand.verma@college.edu',
                'phone': '9876543212',
                'department': 'EEE',
                'designation': 'Assistant Professor',
                'qualification': 'M.Tech Power Systems',
                'specialization': 'Power Electronics',
                'date_of_joining': date(2019, 8, 1),
                'salary': Decimal('58000'),
                'status': 'Active',
            },
            {
                'employee_id': 'FAC004',
                'first_name': 'Sunita',
                'last_name': 'Patel',
                'email': 'sunita.patel@college.edu',
                'phone': '9876543213',
                'department': 'ME',
                'designation': 'Professor',
                'qualification': 'Ph.D. Mechanical Engineering',
                'specialization': 'Thermal Engineering',
                'date_of_joining': date(2013, 3, 10),
                'salary': Decimal('90000'),
                'status': 'Active',
            },
            {
                'employee_id': 'FAC005',
                'first_name': 'Vikram',
                'last_name': 'Singh',
                'email': 'vikram.singh@college.edu',
                'phone': '9876543214',
                'department': 'CE',
                'designation': 'Assistant Professor',
                'qualification': 'M.Tech Structural Engineering',
                'specialization': 'Structural Analysis',
                'date_of_joining': date(2020, 1, 5),
                'salary': Decimal('52000'),
                'status': 'Active',
            },
            {
                'employee_id': 'FAC006',
                'first_name': 'Meena',
                'last_name': 'Reddy',
                'email': 'meena.reddy@college.edu',
                'phone': '9876543215',
                'department': 'IT',
                'designation': 'Associate Professor',
                'qualification': 'Ph.D. Information Technology',
                'specialization': 'Data Science',
                'date_of_joining': date(2016, 7, 20),
                'salary': Decimal('76000'),
                'status': 'Active',
            },
        ]

        for data in faculty_data:
            Faculty.objects.get_or_create(
                employee_id=data['employee_id'],
                defaults=data,
            )
        self.stdout.write(f'  Created {len(faculty_data)} faculty members')

    def create_students(self):
        departments = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT']
        student_data = [
            ('STU001', 'Amit', 'Sharma', 'amit.sharma@student.edu', '9876500001', 'M', 'CSE', 3, 2023),
            ('STU002', 'Neha', 'Gupta', 'neha.gupta@student.edu', '9876500002', 'F', 'CSE', 3, 2023),
            ('STU003', 'Rahul', 'Joshi', 'rahul.joshi@student.edu', '9876500003', 'M', 'ECE', 3, 2023),
            ('STU004', 'Pooja', 'Desai', 'pooja.desai@student.edu', '9876500004', 'F', 'ECE', 3, 2023),
            ('STU005', 'Karan', 'Malhotra', 'karan.malhotra@student.edu', '9876500005', 'M', 'EEE', 3, 2023),
            ('STU006', 'Ishita', 'Bose', 'ishita.bose@student.edu', '9876500006', 'F', 'EEE', 3, 2023),
            ('STU007', 'Vikash', 'Yadav', 'vikash.yadav@student.edu', '9876500007', 'M', 'ME', 3, 2023),
            ('STU008', 'Sakshi', 'Mishra', 'sakshi.mishra@student.edu', '9876500008', 'F', 'ME', 3, 2023),
            ('STU009', 'Deepak', 'Rao', 'deepak.rao@student.edu', '9876500009', 'M', 'CE', 3, 2023),
            ('STU010', 'Anjali', 'Nair', 'anjali.nair@student.edu', '9876500010', 'F', 'CE', 3, 2023),
            ('STU011', 'Rohan', 'Tiwari', 'rohan.tiwari@student.edu', '9876500011', 'M', 'IT', 3, 2023),
            ('STU012', 'Divya', 'Chauhan', 'divya.chauhan@student.edu', '9876500012', 'F', 'IT', 3, 2023),
        ]

        for roll_no, fname, lname, email, phone, gender, dept, sem, year in student_data:
            Student.objects.get_or_create(
                roll_no=roll_no,
                defaults={
                    'first_name': fname,
                    'last_name': lname,
                    'email': email,
                    'phone': phone,
                    'date_of_birth': date(random.randint(2002, 2004), random.randint(1, 12), random.randint(1, 28)),
                    'gender': gender,
                    'department': dept,
                    'semester': sem,
                    'admission_year': year,
                    'address': f'{random.randint(1, 500)}, College Road, City',
                    'blood_group': random.choice(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-']),
                    'guardian_name': f'{fname}\'s Parent',
                    'guardian_phone': f'98765{random.randint(10000, 99999)}',
                    'status': 'Active',
                },
            )
        self.stdout.write(f'  Created {len(student_data)} students')

    def create_courses(self):
        faculty_list = list(Faculty.objects.all())
        course_data = [
            ('CSE301', 'Data Structures & Algorithms', 'CSE', 3, 4, 3, 1, faculty_list[0]),
            ('CSE302', 'Database Management Systems', 'CSE', 3, 3, 3, 1, faculty_list[0]),
            ('ECE301', 'Digital Electronics', 'ECE', 3, 4, 3, 1, faculty_list[1]),
            ('ECE302', 'Signals & Systems', 'ECE', 3, 3, 3, 1, faculty_list[1]),
            ('EEE301', 'Power Systems', 'EEE', 3, 4, 3, 1, faculty_list[2]),
            ('EEE302', 'Control Systems', 'EEE', 3, 3, 3, 1, faculty_list[2]),
            ('ME301', 'Thermodynamics', 'ME', 3, 4, 3, 1, faculty_list[3]),
            ('ME302', 'Fluid Mechanics', 'ME', 3, 3, 3, 1, faculty_list[3]),
            ('CE301', 'Structural Analysis', 'CE', 3, 4, 3, 1, faculty_list[4]),
            ('CE302', 'Surveying', 'CE', 3, 3, 3, 1, faculty_list[4]),
            ('IT301', 'Web Technologies', 'IT', 3, 3, 3, 1, faculty_list[5]),
            ('IT302', 'Cloud Computing', 'IT', 3, 3, 3, 1, faculty_list[5]),
            ('CSE303', 'Operating Systems', 'CSE', 3, 4, 3, 1, faculty_list[0]),
            ('CSE304', 'Computer Networks', 'CSE', 3, 3, 3, 1, faculty_list[0]),
        ]

        for code, name, dept, sem, credits, theory, practical, faculty in course_data:
            Course.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'department': dept,
                    'semester': sem,
                    'credits': credits,
                    'theory_hours': theory,
                    'practical_hours': practical,
                    'max_strength': 60,
                    'faculty': faculty,
                    'status': 'Active',
                },
            )
        self.stdout.write(f'  Created {len(course_data)} courses')

    def create_users(self):
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@college.edu',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            },
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()

        students = Student.objects.all()
        for i, student in enumerate(students, 1):
            username = f'student{i}'
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': student.email,
                    'first_name': student.first_name,
                    'last_name': student.last_name,
                    'role': 'student',
                    'is_active': True,
                    'student_profile': student,
                },
            )
            if created:
                user.set_password('student123')
                user.save()

        faculty_list = Faculty.objects.all()
        for i, fac in enumerate(faculty_list, 1):
            username = f'faculty{i}'
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': fac.email,
                    'first_name': fac.first_name,
                    'last_name': fac.last_name,
                    'role': 'faculty',
                    'is_active': True,
                    'faculty_profile': fac,
                },
            )
            if created:
                user.set_password('faculty123')
                user.save()

        total = 1 + Student.objects.count() + Faculty.objects.count()
        self.stdout.write(f'  Created {total} user accounts')

    def create_enrollments(self):
        students = list(Student.objects.all())
        courses = list(Course.objects.all())
        count = 0

        for student in students:
            dept_courses = [c for c in courses if c.department == student.department]
            for course in dept_courses:
                _, created = Enrollment.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={'status': 'Enrolled'},
                )
                if created:
                    count += 1

        self.stdout.write(f'  Created {count} enrollments')

    def create_fee_structures(self):
        departments = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT']
        fee_types = [
            ('Tuition Fee', 45000),
            ('Lab Fee', 8000),
            ('Library Fee', 2000),
            ('Exam Fee', 3000),
            ('Sports Fee', 1500),
        ]
        count = 0

        for dept in departments:
            for semester in range(1, 9):
                for fee_type, amount in fee_types:
                    _, created = FeeStructure.objects.get_or_create(
                        department=dept,
                        semester=semester,
                        fee_type=fee_type,
                        defaults={
                            'amount': Decimal(str(amount)),
                            'academic_year': '2024-25',
                            'due_date': date(2024, 9, 30),
                        },
                    )
                    if created:
                        count += 1

        self.stdout.write(f'  Created {count} fee structures')

    def create_fee_payments(self):
        students = list(Student.objects.all()[:6])
        structures = list(FeeStructure.objects.filter(semester=3)[:12])
        count = 0

        for student in students:
            student_structures = [s for s in structures if s.department == student.department]
            for structure in student_structures[:2]:
                _, created = FeePayment.objects.get_or_create(
                    student=student,
                    structure=structure,
                    defaults={
                        'amount_paid': structure.amount,
                        'payment_method': random.choice(['Cash', 'Online', 'Card']),
                        'transaction_id': f'TXN{random.randint(100000, 999999)}',
                        'receipt_no': f'REC{random.randint(1000, 9999)}',
                        'status': 'Paid',
                        'remarks': 'Full payment',
                    },
                )
                if created:
                    count += 1

        self.stdout.write(f'  Created {count} fee payments')

    def create_library_books(self):
        book_data = [
            ('9788120345678', 'Data Structures Using C', 'Reema Thareja', 'PHI Learning', 'Textbook', '2nd', 10, 7, 'Aisle-A1'),
            ('9788120340123', 'Database System Concepts', 'Silberschatz, Korth, Sudarshan', 'McGraw Hill', 'Textbook', '7th', 8, 5, 'Aisle-A2'),
            ('9780134685991', 'Operating System Concepts', 'Silberschatz, Galvin, Gagne', 'Wiley', 'Reference', '10th', 6, 4, 'Aisle-B1'),
            ('9789389347067', 'Computer Networks', 'Andrew S. Tanenbaum', 'Pearson', 'Textbook', '5th', 8, 6, 'Aisle-B2'),
            ('9789389802337', 'Artificial Intelligence', 'Stuart Russell', 'Pearson', 'Reference', '3rd', 5, 3, 'Aisle-C1'),
        ]

        count = 0
        for isbn, title, author, publisher, category, edition, total, available, location in book_data:
            _, created = Book.objects.get_or_create(
                isbn=isbn,
                defaults={
                    'title': title,
                    'author': author,
                    'publisher': publisher,
                    'category': category,
                    'edition': edition,
                    'total_copies': total,
                    'available_copies': available,
                    'location': location,
                },
            )
            if created:
                count += 1

        self.stdout.write(f'  Created {count} library books')

    def create_book_issues(self):
        students = list(Student.objects.all()[:3])
        books = list(Book.objects.all()[:3])
        count = 0

        for i, (student, book) in enumerate(zip(students, books)):
            issue, created = BookIssue.objects.get_or_create(
                book=book,
                student=student,
                defaults={
                    'due_date': date.today() + timedelta(days=14),
                    'status': 'Issued',
                },
            )
            if created:
                count += 1

        self.stdout.write(f'  Created {count} book issues')

    def create_exams(self):
        cse_courses = list(Course.objects.filter(department='CSE'))
        count = 0

        for course in cse_courses[:3]:
            for exam_name, exam_type in [
                ('Internal Test 1', 'Internal'),
                ('Mid Semester Exam', 'Mid-Semester'),
            ]:
                exam, created = Exam.objects.get_or_create(
                    name=f'{exam_name} - {course.name}',
                    course=course,
                    defaults={
                        'exam_type': exam_type,
                        'max_marks': 100 if exam_type == 'Mid-Semester' else 30,
                        'pass_marks': 40 if exam_type == 'Mid-Semester' else 12,
                        'exam_date': date.today() + timedelta(days=random.randint(30, 60)),
                        'start_time': '09:00',
                        'end_time': '12:00',
                        'status': 'Scheduled',
                    },
                )
                if created:
                    count += 1

        self.stdout.write(f'  Created {count} exams')

    def create_attendance(self):
        students = list(Student.objects.all()[:6])
        cse_courses = list(Course.objects.filter(department='CSE'))
        faculty = list(Faculty.objects.filter(department='CSE'))

        if not cse_courses or not faculty:
            return

        count = 0
        for course in cse_courses[:2]:
            for i in range(5):
                att_date = date.today() - timedelta(days=i)
                for student in students:
                    if student.department == 'CSE':
                        _, created = Attendance.objects.get_or_create(
                            student=student,
                            course=course,
                            date=att_date,
                            defaults={
                                'status': random.choice(['Present', 'Present', 'Present', 'Absent', 'Late']),
                                'remarks': '',
                                'marked_by': faculty[0] if faculty else None,
                            },
                        )
                        if created:
                            count += 1

        self.stdout.write(f'  Created {count} attendance records')
