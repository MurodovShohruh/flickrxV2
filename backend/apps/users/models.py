from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from common.models import UUIDModel, TimeStampedModel
from common.validators import validate_username


class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra):
        if not email:
            raise ValueError('Email majburiy')
        user = self.model(
            email=self.normalize_email(email),
            username=username.lower(),
            **extra
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra):
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        extra.setdefault('is_admin', True)
        return self.create_user(email, username, password, **extra)

    def get_by_natural_key(self, email):
        return self.get(email__iexact=email)


class User(UUIDModel, TimeStampedModel, AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=50, unique=True, validators=[validate_username])
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(max_length=300, blank=True)
    profile_image = models.ImageField(upload_to='avatars/', null=True, blank=True)
    website = models.URLField(blank=True)

    followers_count = models.PositiveIntegerField(default=0)
    following_count = models.PositiveIntegerField(default=0)
    posts_count = models.PositiveIntegerField(default=0)

    is_verified = models.BooleanField(default=False)
    is_private = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    OAUTH_CHOICES = [('google', 'Google'), ('facebook', 'Facebook'), ('apple', 'Apple')]
    oauth_provider = models.CharField(max_length=20, choices=OAUTH_CHOICES, blank=True)
    oauth_id = models.CharField(max_length=255, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    objects = UserManager()

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return self.username

    @property
    def profile_image_url(self):
        return self.profile_image.url if self.profile_image else None

    def update_counts(self):
        """Sanagichlarni qayta hisoblash."""
        self.followers_count = self.followers_set.count()
        self.following_count = self.following_set.count()
        self.posts_count = self.posts.filter(status='published').count()
        self.save(update_fields=['followers_count', 'following_count', 'posts_count'])


class Follow(UUIDModel, TimeStampedModel):
    follower = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='following_set'
    )
    following = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='followers_set'
    )

    class Meta:
        db_table = 'follows'
        unique_together = ('follower', 'following')
        indexes = [
            models.Index(fields=['follower', 'following']),
        ]

    def __str__(self):
        return f'{self.follower.username} -> {self.following.username}'
