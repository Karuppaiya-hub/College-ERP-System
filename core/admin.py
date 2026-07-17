from django.contrib import admin
from .models import (
    Student, Faculty, Course, Enrollment, Attendance,
    Exam, Grade, FeeStructure, FeePayment, Book, BookIssue,
)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('roll_no', 'first_name', 'last_name', 'department', 'semester', 'status')
    list_filter = ('department', 'semester', 'status')
    search_fields = ('roll_no', 'first_name', 'last_name', 'email')


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'first_name', 'last_name', 'department', 'designation', 'status')
    list_filter = ('department', 'status')
    search_fields = ('employee_id', 'first_name', 'last_name', 'email')


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'department', 'semester', 'credits', 'faculty', 'status')
    list_filter = ('department', 'semester', 'status')
    search_fields = ('code', 'name')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrolled_date', 'status')
    list_filter = ('status',)


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'date', 'status', 'marked_by')
    list_filter = ('status', 'date')


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'exam_type', 'exam_date', 'status')
    list_filter = ('exam_type', 'status')


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('student', 'exam', 'marks_obtained', 'grade')
    list_filter = ('grade',)


@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ('department', 'semester', 'fee_type', 'amount', 'academic_year')
    list_filter = ('department', 'semester')


@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = ('student', 'structure', 'amount_paid', 'payment_method', 'status')
    list_filter = ('status', 'payment_method')


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('isbn', 'title', 'author', 'category', 'available_copies')
    list_filter = ('category',)


@admin.register(BookIssue)
class BookIssueAdmin(admin.ModelAdmin):
    list_display = ('book', 'student', 'issue_date', 'due_date', 'return_date', 'status', 'fine')
    list_filter = ('status',)
