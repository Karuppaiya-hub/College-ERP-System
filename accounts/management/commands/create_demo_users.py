from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create demo users: admin, student, faculty'

    def handle(self, *args, **kwargs):
        users = [
            dict(username='admin',    password='admin123',   role='admin',   email='admin@college.edu',    first_name='Admin',       last_name='User',   is_staff=True, is_superuser=True),
            dict(username='student1', password='student123', role='student', email='student1@college.edu', first_name='Ravi',        last_name='Kumar'),
            dict(username='student2', password='student123', role='student', email='student2@college.edu', first_name='Priya',       last_name='Sharma'),
            dict(username='faculty1', password='faculty123', role='faculty', email='faculty1@college.edu', first_name='Dr. Raj',     last_name='Patel'),
            dict(username='faculty2', password='faculty123', role='faculty', email='faculty2@college.edu', first_name='Prof. Meena', last_name='Iyer'),
        ]

        for u in users:
            password = u.pop('password')
            obj, created = User.objects.get_or_create(username=u['username'], defaults=u)
            if created:
                obj.set_password(password)
                obj.save()
                self.stdout.write(self.style.SUCCESS(f"  Created : {obj.username} ({obj.role})"))
            else:
                self.stdout.write(f"  Exists  : {obj.username}")

        self.stdout.write(self.style.SUCCESS('\nDemo users ready!'))
        self.stdout.write('  admin    / admin123')
        self.stdout.write('  student1 / student123')
        self.stdout.write('  faculty1 / faculty123')
