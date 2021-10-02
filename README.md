# Preparando Ambiente

Versao do python 3.7

- gerar Ambiente virtual = python -m venv env
- rodar o bat = ativaEnv.bat
- instalar as bibliotecas = pip install -r requirements.txt
- gerar o banco = python manage.py migrate
- iniciar o servidor localhost = python manage.py runserver 
    ou 
        iniciar o servidor externo = python manage.py runserver 0.0.0.0:8000 

# Servidor de aplicaçao

aplicaçao foi feita em Django para fornecer o backend e o frontend
frontend e feito em javascript + jquery e algumas blibliotecas de estilo

# Compilação

Para compilar o projeto basta execultar o comando:
    pyinstaller IalPrevisao.spec

depois de compilado passar o argumento runserver
ex: ialPrevisao.exe runserver 0.0.0.0:8000


# EndPoints da api

- api/buscaprevisao/  metodo Post passar no body o json {"cidade":"nome cidade"}

- api/historico/ metodo Get passar como paramentro a cidade
    ex:api/historico?cidade=Gurupi