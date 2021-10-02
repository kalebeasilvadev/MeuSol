from datetime import timedelta, datetime
from dateutil.relativedelta import relativedelta


class trataData():
    def __init__(self, data, format=True):
        if type(data) is str:
            self.data = datetime.strptime(
                data, '%Y-%m-%d').date()
        else:
            self.data = data
        self.format = format
        self.mes()
        self.semana()
        self.dia()

    def mes(self):
        day = self.data.day
        if day > 0:
            self.inicio_mes = self.data - timedelta(days=int(day - 1))
        else:
            self.inicio_mes = self.data

        fim = self.inicio_mes + relativedelta(months=+1)
        if self.format:
            self.fim_mes = fim.strftime("%Y-%m-%d")
            self.inicio_mes = self.inicio_mes.strftime("%Y-%m-%d")
        else:
            self.fim_mes = fim.strftime("%Y%m%d")
            self.inicio_mes = self.inicio_mes.strftime("%Y%m%d")

    def semana(self):
        self.wkday = self.data.weekday()
        inicio_semana = 0
        if self.wkday > 0:
            inicio_semana = self.data - timedelta(days=int(self.wkday))
        else:
            inicio_semana = self.data
        fim = inicio_semana + timedelta(days=7)
        if self.format:
            self.fim_semana = fim.strftime("%Y-%m-%d")
            self.inicio_semana = inicio_semana.strftime("%Y-%m-%d")
        else:
            self.fim_semana = fim.strftime("%Y%m%d")
            self.inicio_semana = inicio_semana.strftime("%Y%m%d")

    def dia(self):
        fim = self.data + timedelta(days=1)
        if self.format:
            self.fim_dia = fim.strftime("%Y-%m-%d")
            self.inicio_dia = self.data.strftime("%Y-%m-%d")
        else:
            self.fim_dia = fim.strftime("%Y%m%d")
            self.inicio_dia = self.data.strftime("%Y%m%d")
