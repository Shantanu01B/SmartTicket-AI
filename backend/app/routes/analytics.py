from flask import Blueprint, jsonify
from app.models.ticket import Ticket
from app.models.department import Department
from app.extensions import db
from sqlalchemy import func
from flask_jwt_extended import jwt_required

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    total_tickets = Ticket.query.count()
    open_tickets = Ticket.query.filter_by(status='Open').count()
    resolved_tickets = Ticket.query.filter_by(status='Resolved').count()
    pending_tickets = Ticket.query.filter_by(status='Pending').count()
    critical_tickets = Ticket.query.filter_by(urgency='Critical').count()
    
    return jsonify({
        "total": total_tickets,
        "open": open_tickets,
        "resolved": resolved_tickets,
        "pending": pending_tickets,
        "critical": critical_tickets
    }), 200

@analytics_bp.route('/department-workload', methods=['GET'])
@jwt_required()
def get_department_workload():
    # count tickets per department
    results = db.session.query(
        Department.name, 
        func.count(Ticket.id)
    ).outerjoin(Ticket, Department.id == Ticket.department_id).group_by(Department.name).all()
    
    data = [{"department": r[0], "count": r[1]} for r in results]
    return jsonify(data), 200
