def validate_image_file(file):
    """Validate the uploaded image file."""
    if not file:
        return False, "No file provided."
    
    if not file.filename:
        return False, "No filename provided."
    
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    
    if file_extension not in allowed_extensions:
        return False, "File type not allowed. Allowed types are: png, jpg, jpeg, gif."
    
    return True, "File is valid."

def validate_user_data(user_data):
    """Validate user registration data."""
    required_fields = ['username', 'email', 'password']
    for field in required_fields:
        if field not in user_data:
            return False, f"{field} is required."
    
    if len(user_data['password']) < 6:
        return False, "Password must be at least 6 characters long."
    
    return True, "User data is valid."