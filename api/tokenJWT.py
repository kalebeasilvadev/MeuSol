from token_jwt.serializers import TokenObtainSerializer
from token_jwt.views import TokenViewBase
from token_jwt.tokens import RefreshToken
from rest_framework import viewsets


class MyTokenObtainPairSerializer(TokenObtainSerializer):
    # @classmethod
    # def get_token(cls, user):
    #     token = super().get_token(user)
    #     # Add custom claims
    #     token['username'] = str(user)
    #     # token['nivel'] = user.nivel
    #     # ...

    #     return token

    @classmethod
    def get_token(cls, user):
        return RefreshToken.for_user(user)

    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = self.get_token(self.user)

        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        print(data)
        return data


class MyTokenObtainPairView(TokenViewBase, viewsets.ModelViewSet):
    print('aqui')
    def create(self, request, *args, **kwargs):
        print('asd')
        print(request)
    serializer_class = MyTokenObtainPairSerializer
    print(serializer_class)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
