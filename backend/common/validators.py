from django.core.exceptions import ValidationError


def validate_image_size(file):
    if file.size > 10 * 1024 * 1024:
        raise ValidationError('Rasm 10MB dan katta bo\'lmasligi kerak')


def validate_video_size(file):
    if file.size > 500 * 1024 * 1024:
        raise ValidationError('Video 500MB dan katta bo\'lmasligi kerak')


def validate_username(value):
    import re
    if not re.match(r'^[a-zA-Z0-9_]{3,50}$', value):
        raise ValidationError('Username faqat harf, raqam va _ dan iborat bo\'lishi kerak (3-50 belgi)')
