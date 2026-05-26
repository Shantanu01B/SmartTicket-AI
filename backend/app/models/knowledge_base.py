from app.extensions import db
from datetime import datetime

class KnowledgeBase(db.Model):
    __tablename__ = 'knowledge_base'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    issue_summary = db.Column(db.Text, nullable=True)
    symptoms = db.Column(db.Text, nullable=True)
    root_cause = db.Column(db.Text, nullable=True)
    resolution_steps = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(100), nullable=True)
    tags = db.Column(db.Text, nullable=True) # Stored as comma-separated string
    is_approved = db.Column(db.Boolean, default=False, nullable=False)
    views = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'issue_summary': self.issue_summary,
            'symptoms': self.symptoms,
            'root_cause': self.root_cause,
            'resolution_steps': self.resolution_steps,
            'category': self.category,
            'tags': [t.strip() for t in self.tags.split(',')] if self.tags else [],
            'is_approved': self.is_approved,
            'views': self.views,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
