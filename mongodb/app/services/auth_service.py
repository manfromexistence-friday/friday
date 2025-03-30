from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.models.user import User
from app.utils.db import get_db

def register_user(username, password):
    db = get_db()
    hashed_password = generate_password_hash(password, method='sha256')
    new_user = User(username=username, password=hashed_password)
    
    db.users.insert_one(new_user.to_dict())
    return {"message": "User registered successfully"}, 201

def login_user(username, password):
    db = get_db()
    user = db.users.find_one({"username": username})
    
    if user and check_password_hash(user['password'], password):
        return {"message": "Login successful"}, 200
    return {"message": "Invalid credentials"}, 401

def get_user(username):
    db = get_db()
    user = db.users.find_one({"username": username})
    
    if user:
        return {"username": user['username']}, 200
    return {"message": "User not found"}, 404