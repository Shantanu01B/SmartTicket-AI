from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.ml_service import predict_chatbot_intent, get_chatbot_response

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    data = request.get_json()
    messages = data.get('messages', [])
    
    if not messages:
        return jsonify({"msg": "Messages required"}), 400
        
    last_msg = messages[-1].get('content', '').lower()
    
    # ML-powered Intent Classification
    intent = predict_chatbot_intent(last_msg)
    response_text = get_chatbot_response(intent)
        
    return jsonify({"response": response_text}), 200
