import subprocess
import uuid
import json
from pathlib import Path
from django.conf import settings


def generate_video_thumbnail(video_name: str) -> str | None:
    """
    video_name: media_file.name (masalan: posts/2024/01/abc.mp4)
    Thumbnail yaratib, uning name'ini qaytaradi.
    """
    try:
        video_path = Path(settings.MEDIA_ROOT) / video_name
        if not video_path.exists():
            return None

        thumb_name = f"thumbnails/thumb_{uuid.uuid4().hex}.jpg"
        thumb_path = Path(settings.MEDIA_ROOT) / thumb_name
        thumb_path.parent.mkdir(parents=True, exist_ok=True)

        subprocess.run([
            'ffmpeg', '-i', str(video_path),
            '-ss', '00:00:01', '-vframes', '1',
            '-q:v', '2', str(thumb_path),
            '-y', '-loglevel', 'error'
        ], check=True, timeout=30)

        return thumb_name
    except Exception:
        return None


def get_video_duration(video_name: str) -> int | None:
    """Video davomiyligini soniyada qaytaradi."""
    try:
        video_path = Path(settings.MEDIA_ROOT) / video_name
        result = subprocess.run([
            'ffprobe', '-v', 'quiet', '-print_format', 'json',
            '-show_format', str(video_path)
        ], capture_output=True, text=True)
        data = json.loads(result.stdout)
        return int(float(data.get('format', {}).get('duration', 0)))
    except Exception:
        return None


def parse_hashtags(text: str) -> list[str]:
    """Matndan hashtag lar chiqarib olish."""
    import re
    return list(set(tag.lower() for tag in re.findall(r'#(\w+)', text)))
