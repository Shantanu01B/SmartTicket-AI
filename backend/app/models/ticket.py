from app.extensions import db
from datetime import datetime

class Ticket(db.Model):
    __tablename__ = 'tickets'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=True)
    urgency = db.Column(db.String(50), nullable=True) # Low, Medium, High, Critical
    status = db.Column(db.String(50), nullable=False, default='Open') # Open, In Progress, Pending, Resolved, Closed
    
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    sla_deadline = db.Column(db.DateTime, nullable=True)
    
    # AI generated fields
    ai_summary = db.Column(db.Text, nullable=True)
    ai_solution = db.Column(db.Text, nullable=True)

    # Relationships
    comments = db.relationship('TicketComment', backref='ticket', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'urgency': self.urgency,
            'status': self.status,
            'department_id': self.department_id,
            'created_by': self.created_by,
            'assigned_to': self.assigned_to,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'sla_deadline': self.sla_deadline.isoformat() if self.sla_deadline else None,
            'ai_summary': self.ai_summary,
            'ai_solution': self.ai_solution
        }
