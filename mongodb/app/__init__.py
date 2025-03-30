from flask import Flask

def create_app():
    app = Flask(__name__)
    
    with app.app_context():
        from .routes import auth_routes, image_routes, api_routes
        app.register_blueprint(auth_routes.bp)
        app.register_blueprint(image_routes.bp)
        app.register_blueprint(api_routes.bp)

    return app