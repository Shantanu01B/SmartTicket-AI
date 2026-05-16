from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.department import Department
from app.extensions import bcrypt

app = create_app()

def init_db():
    with app.app_context():
        # Create all tables
        db.create_all()

        # Check if admin exists
        admin = User.query.filter_by(email='admin@smartticket.ai').first()
        if not admin:
            hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
            admin = User(name='Admin User', email='admin@smartticket.ai', password_hash=hashed_password, role='admin')
            db.session.add(admin)
            print("Created admin user.")

        # Check if basic departments exist
        if not Department.query.first():
            depts = ['DevOps', 'Backend Team', 'Frontend Team', 'Security Team', 'Finance Team', 'IT Support']
            for dept in depts:
                db.session.add(Department(name=dept))
            print("Created initial departments.")

        db.session.commit()
        print("Database initialized successfully.")

if __name__ == '__main__':
    init_db()
