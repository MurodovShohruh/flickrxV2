import os
from django.conf import settings


def get_upload_path(instance, filename, subfolder=''):
    """Fayl yuklash yo'li."""
    import uuid
    ext = os.path.splitext(filename)[1].lower()
    new_name = f"{uuid.uuid4().hex}{ext}"
    return os.path.join(subfolder, new_name) if subfolder else new_name
