from rest_framework.serializers import ModelSerializer
from .models import User, Historico


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'nivel')


class HistoricoSerializer(ModelSerializer):
    class Meta:
        model = Historico
        fields = ('id', 'cidade', 'databusca', 'jsonDados')
