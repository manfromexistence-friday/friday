from mongoengine import Document, StringField, EmailField, DateTimeField, ImageField
from datetime import datetime

class User(Document):
    username = StringField(required=True, unique=True)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    profile_image = ImageField()  # This field will store the user's profile image in MongoDB GridFS

    def __str__(self):
        return self.username

    def save_user(self):
        self.save()  # Save the user instance to the database

    @classmethod
    def get_user_by_id(cls, user_id):
        return cls.objects(id=user_id).first()  # Retrieve a user by their ID

    @classmethod
    def get_user_by_username(cls, username):
        return cls.objects(username=username).first()  # Retrieve a user by their username