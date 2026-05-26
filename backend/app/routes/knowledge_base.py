from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.knowledge_base import KnowledgeBase
from app.models.ticket import Ticket
from app.models.user import User
from app.services.knowledge_base_service import search_articles, suggest_related_articles, create_knowledge_article
from app.utils.decorators import admin_required, support_agent_required
from flask_jwt_extended import jwt_required, get_jwt_identity

kb_bp = Blueprint('knowledge_base', __name__)

@kb_bp.route('/', methods=['GET'])
@jwt_required()
def get_articles():
    """
    Fetch searchable list of knowledge articles.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    is_admin = user and user.role == 'admin'
    
    q = request.args.get('q', '')
    category = request.args.get('category', '')
    
    # If search text is provided, use cosine similarity search
    if q:
        # Admins can search unapproved articles as well
        results = search_articles(q, filter_approved=not is_admin, limit=20)
        # Format output
        articles_data = []
        for r in results:
            art_dict = r['article']
            art_dict['score'] = round(r['score'] * 100)
            # Apply category filter on top if specified
            if category and art_dict['category'] != category:
                continue
            articles_data.append(art_dict)
        return jsonify(articles_data), 200
        
    # Else standard SQLAlchemy query
    query = KnowledgeBase.query
    if not is_admin:
        query = query.filter_by(is_approved=True)
        
    if category:
        query = query.filter_by(category=category)
        
    articles = query.order_by(KnowledgeBase.created_at.desc()).all()
    return jsonify([a.to_dict() for a in articles]), 200

@kb_bp.route('/<int:article_id>', methods=['GET'])
@jwt_required()
def get_article(article_id):
    """
    Fetch a single article and increment its view count.
    """
    article = KnowledgeBase.query.get_or_404(article_id)
    article.views += 1
    db.session.commit()
    return jsonify(article.to_dict()), 200

@kb_bp.route('/recommend', methods=['POST'])
@jwt_required()
def recommend_solutions():
    """
    Recommend solution articles before submitting a ticket.
    """
    data = request.get_json()
    title = data.get('title', '')
    description = data.get('description', '')
    
    combined_text = f"{title} {description}"
    if not title:
        return jsonify([]), 200
        
    results = search_articles(combined_text, filter_approved=True, limit=3)
    
    recommended = []
    for r in results:
        # Match score threshold (e.g. 0.35 or 35%)
        if r['score'] >= 0.35:
            art_dict = r['article']
            art_dict['match_score'] = round(r['score'] * 100)
            recommended.append(art_dict)
            
    return jsonify(recommended), 200

@kb_bp.route('/related/<int:ticket_id>', methods=['GET'])
@jwt_required()
def get_related_articles(ticket_id):
    """
    Suggest related solutions for an active ticket page.
    """
    ticket = Ticket.query.get_or_404(ticket_id)
    related = suggest_related_articles(ticket, limit=3)
    return jsonify(related), 200

@kb_bp.route('/<int:article_id>/approve', methods=['POST'])
@jwt_required()
@admin_required()
def approve_article(article_id):
    """
    Approve generated article (Admin only).
    """
    article = KnowledgeBase.query.get_or_404(article_id)
    article.is_approved = True
    db.session.commit()
    return jsonify(article.to_dict()), 200

@kb_bp.route('/<int:article_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_article(article_id):
    """
    Update article content (Admin only).
    """
    article = KnowledgeBase.query.get_or_404(article_id)
    data = request.get_json()
    
    if 'title' in data:
        article.title = data['title']
    if 'issue_summary' in data:
        article.issue_summary = data['issue_summary']
    if 'symptoms' in data:
        article.symptoms = data['symptoms']
    if 'root_cause' in data:
        article.root_cause = data['root_cause']
    if 'resolution_steps' in data:
        article.resolution_steps = data['resolution_steps']
    if 'category' in data:
        article.category = data['category']
    if 'tags' in data:
        # If tags is a list, join it
        tags_val = data['tags']
        if isinstance(tags_val, list):
            article.tags = ", ".join(tags_val)
        else:
            article.tags = str(tags_val)
            
    db.session.commit()
    return jsonify(article.to_dict()), 200

@kb_bp.route('/<int:article_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_article(article_id):
    """
    Delete article (Admin only).
    """
    article = KnowledgeBase.query.get_or_404(article_id)
    db.session.delete(article)
    db.session.commit()
    return jsonify({"msg": "Article deleted successfully"}), 200

@kb_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required()
def create_article_manually():
    """
    Manually create a knowledge article (Admin only).
    """
    data = request.get_json()
    title = data.get('title')
    issue_summary = data.get('issue_summary', '')
    symptoms = data.get('symptoms', '')
    root_cause = data.get('root_cause', '')
    resolution_steps = data.get('resolution_steps')
    category = data.get('category', 'General')
    tags = data.get('tags', '')
    
    if not title or not resolution_steps:
        return jsonify({"msg": "Title and resolution steps are required"}), 400
        
    if isinstance(tags, list):
        tags_str = ", ".join(tags)
    else:
        tags_str = str(tags)
        
    article = KnowledgeBase(
        title=title,
        issue_summary=issue_summary,
        symptoms=symptoms,
        root_cause=root_cause,
        resolution_steps=resolution_steps,
        category=category,
        tags=tags_str,
        is_approved=True, # Manually created ones are auto-approved
        views=0
    )
    
    db.session.add(article)
    db.session.commit()
    return jsonify(article.to_dict()), 201
