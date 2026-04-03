from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender='users.User')
def user_post_save(sender, instance, created, **kwargs):
    if created:
        pass
