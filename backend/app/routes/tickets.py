from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.ticket import Ticket
from app.models.department import Department
from app.models.comment import TicketComment
from app.services.ml_service import process_ticket, find_similar_tickets
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

tickets_bp = Blueprint('tickets', __name__)

@tickets_bp.route('/', methods=['POST'])
@jwt_required()
def create_ticket():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    title = data.get('title')
    description = data.get('description')
    
    if not title or not description:
        return jsonify({"msg": "Title and description required"}), 400
        
    # Call Local ML Service
    ai_insights = process_ticket(title, description)
    
    dept_name = ai_insights.get('department_name')
    department = Department.query.filter_by(name=dept_name).first()
    dept_id = department.id if department else None
    
    # Calculate basic SLA based on urgency
    urgency = ai_insights.get('urgency', 'Medium')
    sla_hours = {'Low': 48, 'Medium': 24, 'High': 8, 'Critical': 2}.get(urgency, 24)
    sla_deadline = datetime.utcnow() + timedelta(hours=sla_hours)
    
    new_ticket = Ticket(
        title=title,
        description=description,
        category=ai_insights.get('category'),
        urgency=urgency,
        department_id=dept_id,
        created_by=current_user_id,
        sla_deadline=sla_deadline,
        ai_summary=ai_insights.get('summary'),
        ai_solution=ai_insights.get('suggested_solution')
    )
    
    db.session.add(new_ticket)
    db.session.commit()
    
    return jsonify(new_ticket.to_dict()), 201

@tickets_bp.route('/check-duplicates', methods=['POST'])
@jwt_required()
def check_duplicates():
    data = request.get_json()
    title = data.get('title', '')
    description = data.get('description', '')
    
    # Fetch existing active tickets (Open or In Progress)
    existing_tickets = Ticket.query.filter(Ticket.status.in_(['Open', 'In Progress'])).all()
    
    similar = find_similar_tickets(title, description, existing_tickets)
    
    return jsonify(similar), 200

@tickets_bp.route('/', methods=['GET'])
@jwt_required()
def get_tickets():
    current_user_id = get_jwt_identity()
    # In a real app, filter by role (admin sees all, employee sees own)
    # For simplicity, returning all or filtering by creator/assignee can be done here.
    tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tickets]), 200

@tickets_bp.route('/<int:ticket_id>', methods=['GET'])
@jwt_required()
def get_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    return jsonify(ticket.to_dict()), 200

@tickets_bp.route('/<int:ticket_id>', methods=['PUT'])
@jwt_required()
def update_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json()
    
    if 'status' in data:
        ticket.status = data['status']
    if 'assigned_to' in data:
        ticket.assigned_to = data['assigned_to']
    if 'department_id' in data:
        ticket.department_id = data['department_id']
        
    db.session.commit()
    return jsonify(ticket.to_dict()), 200

@tickets_bp.route('/<int:ticket_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(ticket_id):
    comments = TicketComment.query.filter_by(ticket_id=ticket_id).order_by(TicketComment.created_at.asc()).all()
    return jsonify([c.to_dict() for c in comments]), 200

@tickets_bp.route('/<int:ticket_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(ticket_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if 'comment' not in data:
        return jsonify({"msg": "Comment text required"}), 400
        
    comment = TicketComment(
        ticket_id=ticket_id,
        user_id=current_user_id,
        comment=data['comment']
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify(comment.to_dict()), 201
