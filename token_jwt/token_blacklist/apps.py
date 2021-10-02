from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class TokenBlacklistConfig(AppConfig):
    name = 'token.token_blacklist'
    verbose_name = _('Token Blacklist')
