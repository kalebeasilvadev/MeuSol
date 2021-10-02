from django.shortcuts import render


def index(request):
    return render(request, 'index.html', {"name": "index"})


def corpo(request):
    return render(request, 'corpo.html', {})


def menu(request):
    return render(request, 'pages/menu/menu.html', {})


def previsao(request):
    return render(request, 'pages/previsao/previsao.html', {})


def historico(request):
    return render(request, 'pages/historico/historico.html', {})

def irradiance(request):
    return render(request, 'pages/irradiance/irradiance.html', {})
