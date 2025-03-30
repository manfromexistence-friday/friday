from flask import Flask
from app.routes.auth_routes import auth_bp
from app.routes.image_routes import image_bp
from app.routes.api_routes import api_bp

def create_app():
    app = Flask(__name__)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(image_bp)
    app.register_blueprint(api_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)