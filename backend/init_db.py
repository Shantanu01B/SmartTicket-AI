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

        # Check and migrate tickets columns if needed
        from sqlalchemy import inspect
        try:
            inspector = inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('tickets')]
            if 'escalation_score' not in columns:
                print("Migration: Adding escalation columns to tickets table...")
                with db.engine.begin() as conn:
                    conn.execute(db.text("ALTER TABLE tickets ADD COLUMN escalation_score INT NULL"))
                    conn.execute(db.text("ALTER TABLE tickets ADD COLUMN escalation_level VARCHAR(50) NULL"))
                    conn.execute(db.text("ALTER TABLE tickets ADD COLUMN escalation_reason TEXT NULL"))
                print("Migration complete: escalation columns added successfully.")
        except Exception as e:
            print(f"Migration warning/error (might be clean db): {e}")

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
