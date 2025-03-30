from flask import Blueprint

# Initialize the routes blueprint
routes_bp = Blueprint('routes', __name__)

# Import routes to register them with the blueprint
from .auth_routes import *
from .image_routes import *
from .api_routes import *