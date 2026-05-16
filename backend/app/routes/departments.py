from flask import Blueprint, jsonify, request
from app.models.department import Department
from app.utils.decorators import admin_required
from flask_jwt_extended import jwt_required

departments_bp = Blueprint('departments', __name__)

@departments_bp.route('/', methods=['GET'])
def get_departments():
    departments = Department.query.all()
    return jsonify([dept.to_dict() for dept in departments]), 200

@departments_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required()
def create_department():
    from app.extensions import db
    data = request.get_json()
    if 'name' not in data:
        return jsonify({"msg": "Name is required"}), 400
        
    dept = Department(name=data['name'], description=data.get('description', ''))
    db.session.add(dept)
    db.session.commit()
    return jsonify(dept.to_dict()), 201
