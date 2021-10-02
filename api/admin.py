from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from api.models import User, Historico
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.debug import sensitive_post_parameters

csrf_protect_m = method_decorator(csrf_protect)
sensitive_post_parameters_m = method_decorator(sensitive_post_parameters())

admin.site.register(User, UserAdmin)
admin.site.register(Historico)
