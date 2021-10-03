from django_filters import rest_framework as filters
from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from token_jwt.authentication import JWTAuthentication
from .models import User, Historico
from .seriallizers import UserSerializer, HistoricoSerializer
from api.services.dict2obj import obj
import requests
import json
from datetime import datetime, timedelta
from api.services.date import trataData
from api.services.calculadoraSolar import CalculadorSolar
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import io
import base64


def preparaSaida(jsonDados):
    jsonDados = obj(jsonDados)
    saida = dict()
    for x in jsonDados.list:
        data = x.dt_txt.split(' ')
        time = data[1]
        data = datetime.strptime(data[0], "%Y-%m-%d")
        data = str(datetime.strftime(data, "%d/%m/%Y"))
        if data not in saida:
            saida[data] = {"temp": x.main.temp, "time": {}}
        saida[data]['time'][time] = {
            "temp": x.main.temp,
            "min": x.main.temp_min,
            "max": x.main.temp_max,
            "pressure": x.main.pressure,
            "humidity": x.main.humidity,
            "sea_level": x.main.sea_level,
            "wind": x.wind.speed,
            "weather": {
                "main": x.weather[0].main,
                "description": x.weather[0].description,
                "icon": x.weather[0].icon
            },
        }
    return saida


class BuscaPrevisao(viewsets.ModelViewSet):
    def create(self, request, *args, **kwargs):
        dados = obj(request.data)
        CHAVE = "b9e1d7b5ce0e14873b69f59f7facdd3d"
        lat = dados.latitude
        lon = dados.longitude
        URL = f"http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={CHAVE}&units=metric&lang=pt_br"
        # URL = f"http://api.openweathermap.org/data/2.5/forecast?q={CIDADE}&appid={CHAVE}&units=metric&lang=pt_br"

        result = requests.get(URL)
        jsonDados = str(result.json())
        saida = result.json()
        dados = obj(result.json())
        pre = ""
        dataBusca = datetime.now()
        dataBusca = datetime.strftime(dataBusca, '%d/%m/%Y as %H:%M:%S')
        if dados.cod == '200':
            Historico(cidade=dados.city.name, jsonDados=jsonDados).save()
            pre = {
                "dadosPrevisao": preparaSaida(saida),
                "data": dataBusca,
                "cidade": dados.city.name,
            }

        return Response(pre)


class BuscaIrradience(viewsets.ModelViewSet):
    def create(self, request, *args, **kwargs):
        dados = obj(request.data)
        potencia = float(dados.potencia)
        perda = float(dados.perda) / 100
        custo = float(dados.custo)
        date = trataData(datetime.now(), format=False)
        inicio_semana = date.inicio_semana
        fim_semana = date.fim_semana
        inicio = 0
        fim = 0

        if dados.inicio != "" and dados.fim != "":
            fim = datetime.strptime(dados.fim, "%Y-%m-%d").strftime("%Y%m%d")
            inicio = datetime.strptime(
                dados.inicio, "%Y-%m-%d").strftime("%Y%m%d")
        elif dados.inicio != "" and dados.fim == "":
            fim = datetime.strptime(
                dados.inicio, "%Y-%m-%d") + timedelta(days=1).strftime("%Y%m%d")
            inicio = datetime.strptime(
                dados.inicio, "%Y-%m-%d").strftime("%Y%m%d")
        else:
            fim = fim_semana
            inicio = inicio_semana

        base_url = f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=RH2M,T2M,ALLSKY_SFC_SW_DWN&community=RE&longitude={dados.longitude}&latitude={dados.latitude}&start={inicio}&end={fim}&format=JSON"

        response = requests.get(
            url=base_url,
            verify=True,
            timeout=30.00)

        content = json.loads(response.content.decode('utf-8'))
        tabela = []
        irradienceData = content['properties']['parameter']['ALLSKY_SFC_SW_DWN']
        tempData = content['properties']['parameter']['T2M']
        humidityData = content['properties']['parameter']['RH2M']

        ano = 0
        mes = 0

        for key in irradienceData:
            if irradienceData[key] > 0:
                dia = key[6::]
                mes = key[4:6]
                ano = key[0:4]
                tabela.append(
                    (dia, irradienceData[key], tempData[key], humidityData[key]))

        dt = pd.DataFrame(tabela)
        dt = dt.rename(columns={
            0: 'time',
            1: 'irradiance',
            2: 'temperature',
            3: 'humidity'
        })
        dt['energy'] = dt.apply(
            lambda x: CalculadorSolar(
                x['irradiance'], potencia, perda).diario(), axis=1)
        dt['total'] = round(dt['energy'].sum(), 2)
        dt['custo'] = round(dt['energy'] * custo, 2)
        dt['custoTotal'] = round(dt['custo'].sum(), 2)

        dt2 = dt.rename(columns={
            'time': 'Dia',
            'irradiance': 'Irradiação',
            'energy': 'Potencial Energético',
            'temperature': 'Temp (°C)',
            'humidity': 'Umidade Relativa (%)',
            'total': 'Potencial Energético mensal',
            'custo': 'Crédito (R$)',
            'custoTotal': 'Crédito mensal (R$)',
        })

        html = dt2.to_html(classes='table compact responsive',
                           table_id='table_relatorio',
                           sparsify=False, index=False)

        html = html.replace("dataframe ", "").\
            replace('style="text-align: right;"', "").\
            replace('border="1"', "").\
            replace(
            'id="table_relatorio"',
            'id="table_relatorio" style="width:100%"')

        dadosAnos = BuscaDadosAnos(
            dados.latitude,
            dados.longitude,
            dados.inicio,
            dados.fim,
            potencia,
            perda)

        resposta = {
            'dados': dt.to_dict(),
            'mes': dados.inicio.split('-')[1],
            'mes_fim': dados.fim.split('-')[1],
            'ano': ano,
            'html': html,
            'inicio': datetime.strptime(dados.inicio, "%Y-%m-%d").strftime("%d/%m/%Y"),
            'fim': datetime.strptime(dados.fim, "%Y-%m-%d").strftime("%d/%m/%Y"),
            'dia_inicio': dados.inicio.split('-')[2],
            'dia_fim': dados.fim.split('-')[2],
            'dadosAnos': dadosAnos
        }
        return Response(resposta)


class HistoricoViewSet(viewsets.ModelViewSet):
    def list(self, request, *args, **kwargs):
        cidade = request.GET.get('cidade')
        historico = Historico.objects.all()
        if cidade:
            historico = historico.filter(cidade__iexact=cidade)
        dados = list()
        for d in historico:
            jsonDados = d.jsonDados.replace("'", '"')
            dataBusca = datetime.strftime(d.dataBusca, '%d/%m/%Y as %H:%M:%S')
            dados.append({
                "dadosPrevisao": preparaSaida(json.loads(jsonDados)),
                "data": dataBusca,
                "cidade": d.cidade,
            })
        return Response(dados)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = ('id', 'username', 'nivel')
    lookup_field = 'username'

    def create(self, request, *args, **kwargs):
        user_cad = User.objects.create(
            username=request.data['username'], password=request.data['password'], nivel=request.data['nivel'])
        user_cad.save()
        user_cad = User.objects.get(username=request.data['username'])
        user_cad.set_password(request.data['password'])
        user_cad.save()

        data = {
            "username": request.data['username'],
            "nivel": request.data['nivel'],
        }
        return Response(data)

    def partial_update(self, request, *args, **kwargs):
        user_cad = User.objects.filter(username=kwargs['username'])
        user_cad.update(nivel=request.data['nivel'])
        if request.data['password'][0:3] != "pbk":
            user_cad = User.objects.get(username=kwargs['username'])
            user_cad.set_password(request.data['password'])
            user_cad.save()

        data = {
            "username": kwargs['username'],
            "nivel": request.data['nivel'],
        }
        return Response(data)


def BuscaDadosAnos(latitude, longitude, inicio, fim, potencia, perda):
    date = trataData(inicio, format=False)
    irradience = []
    energy = []
    for x in reversed(range(5)):
        date.somaAno(x, inicio, fim)
        inicioLocal = date.inicio_mes_ano
        fimLocal = date.fim_mes_ano
        base_url = f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude={longitude}&latitude={latitude}&start={inicioLocal}&end={fimLocal}&format=JSON"

        response = requests.get(
            url=base_url,
            verify=True,
            timeout=30.00)

        content = json.loads(response.content.decode('utf-8'))
        if not content.get('properties'):
            pass

        irradienceData = content['properties']['parameter']['ALLSKY_SFC_SW_DWN']
        total = 0
        totalPotencia = 0
        for key in irradienceData:
            if irradienceData[key] > 0:
                total += irradienceData[key]
                valor = CalculadorSolar(
                    irradienceData[key], potencia, perda).diario()
                totalPotencia += valor

        ano = inicioLocal[0:4]
        irradience.append({'ano': ano, 'valor': round(total, 2)})
        energy.append({'ano': ano, 'valor': round(totalPotencia, 2)})

    return {'irradience': irradience, 'energy': energy}
