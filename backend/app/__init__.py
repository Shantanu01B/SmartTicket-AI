from flask import Flask
from app.config import Config
from app.extensions import db, jwt, bcrypt, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app)

    # Register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.tickets import tickets_bp
    from app.routes.departments import departments_bp
    from app.routes.analytics import analytics_bp
    from app.routes.ai_chat import ai_bp
    from app.routes.users import users_bp
    from app.routes.knowledge_base import kb_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(tickets_bp, url_prefix='/api/tickets')
    app.register_blueprint(departments_bp, url_prefix='/api/departments')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(kb_bp, url_prefix='/api/knowledge-base')

    return app
