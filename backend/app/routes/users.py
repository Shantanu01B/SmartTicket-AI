from flask import Blueprint, jsonify
from app.models.user import User
from app.utils.decorators import admin_required, support_agent_required
from flask_jwt_extended import jwt_required

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
@jwt_required()
@support_agent_required()
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_user(user_id):
    from flask import request
    from app.extensions import db
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if 'role' in data:
        user.role = data['role']
    if 'department_id' in data:
        user.department_id = data['department_id']
        
    db.session.commit()
    return jsonify(user.to_dict()), 200
