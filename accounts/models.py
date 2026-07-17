from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('student', 'Student'),
        ('faculty', 'Faculty'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    student_profile = models.ForeignKey(
        'core.Student', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='user_account'
    )
    faculty_profile = models.ForeignKey(
        'core.Faculty', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='user_account'
    )

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
