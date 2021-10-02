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
        CIDADE = dados.cidade
        URL = f"http://api.openweathermap.org/data/2.5/forecast?q={CIDADE}&appid={CHAVE}&units=metric&lang=pt_br"

        result = requests.get(URL)
        jsonDados = str(result.json())
        saida = result.json()
        pre = ""
        dataBusca = datetime.now()
        dataBusca = datetime.strftime(dataBusca, '%d/%m/%Y as %H:%M:%S')
        if obj(result.json()).cod == '200':
            Historico(cidade=CIDADE, jsonDados=jsonDados).save()
            pre = {
                "dadosPrevisao": preparaSaida(saida),
                "data": dataBusca,
                "cidade": CIDADE,
            }

        return Response(pre)


class BuscaIrradience(viewsets.ModelViewSet):
    def create(self, request, *args, **kwargs):
        dados = obj(request.data)
        potencia = float(dados.potencia)
        perda = float(dados.perda)/100
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

        base_url = f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,CLRSKY_SFC_SW_DWN,ALLSKY_KT,ALLSKY_NKT,ALLSKY_SFC_LW_DWN,ALLSKY_SFC_PAR_TOT,CLRSKY_SFC_PAR_TOT,ALLSKY_SFC_UVA,ALLSKY_SFC_UVB,ALLSKY_SFC_UV_INDEX&community=RE&longitude={dados.longitude}&latitude={dados.latitude}&start={inicio}&end={fim}&format=JSON"

        response = requests.get(
            url=base_url,
            verify=True,
            timeout=30.00)

        content = json.loads(response.content.decode('utf-8'))
        tabela = []
        irradienceData = content['properties']['parameter']['ALLSKY_SFC_SW_DWN']

        ano = 0
        mes = 0

        for key in irradienceData:
            if irradienceData[key] > 0:
                dataKey = f'{key[6::]}/{key[4:6]}/{key[0:4]}'
                dia = key[6::]
                mes = key[4:6]
                ano = key[0:4]
                tabela.append((dia, irradienceData[key]))

        dt = pd.DataFrame(tabela)
        dt = dt.rename(columns={0: 'time', 1: 'irradiance'})
        dt['energy'] = dt.apply(
            lambda x: CalculadorSolar(
                x['irradiance'], potencia, perda).diario(), axis=1)
        dt['total'] = dt['energy'].sum()
        dt2 = dt.rename(columns={
            'time': 'Dias',
            'irradiance': 'Irradiação',
            'energy': 'Potencial Energético'
        })
        html = dt2.to_html(classes='table compact responsive',
                                                 table_id='table_relatorio',
                                                 sparsify=False, index=False)
        html = html.replace("dataframe ", "").\
            replace('style="text-align: right;"', "").\
            replace('border="1"', "").\
            replace('id="table_relatorio"', 'id="table_relatorio" style="width:100%"').\
            replace('.', ',')
        resposta = {
            'dados': dt.to_dict(),
            'mes': mes,
            'ano': ano,
            'html':html,
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