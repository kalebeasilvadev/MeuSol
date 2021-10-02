import logging
from datetime import datetime
import os
from loggers_tail import app_settings


class loggers():

    def __init__(self, file):
        self.logger = ""
        self.createlogFolder()
        if file == "automacao":
            self.automacao()

    def createlogFolder(self):
        try:
            if not os.path.exists('logs/'):
                os.makedirs('logs/')
        except Exception:
            raise

    def createFolders(self, folder):
        try:
            if not os.path.exists(f'logs/{folder}/'):
                os.makedirs(f'logs/{folder}/')
        except Exception:
            raise

    def automacao(self):
        self.createFolders("automacao")
        FORMAT = '%(asctime)-15s >> %(message)s'
        data = datetime.now().strftime("%Y-%m-%d")
        filename = f"logs/automacao/automacao-{data}.log"
        app_settings.LOGTAIL_FILES.update({"automacao": filename})
        file = open(filename, "a+")
        logging.basicConfig(filename=filename,
                            level=logging.DEBUG, format=FORMAT)
        self.logger = logging.getLogger('')

    def error(self, msg=None):
        FORMAT = '%(asctime)-15s >> %(message)s'
        data = datetime.now().strftime("%Y-%m-%d")
        filename = f"logs/automacao/automacao-{data}.log"
        app_settings.LOGTAIL_FILES.update({"automacao": filename})
        file = open(filename, "a+")
        logging.basicConfig(filename=filename,
                            level=logging.DEBUG, format=FORMAT)
        self.logger = logging.getLogger('')
        self.logger.exception(msg)

    def info(self, msg=None, prefix=None):
        FORMAT = '%(asctime)-15s >> %(message)s'
        data = datetime.now().strftime("%Y-%m-%d")
        filename = f"logs/automacao/automacao-{data}.log"
        app_settings.LOGTAIL_FILES.update({"automacao": filename})
        file = open(filename, "a+")
        logging.basicConfig(filename=filename,
                            level=logging.DEBUG, format=FORMAT)
        self.logger = logging.getLogger('')
        self.logger.info(f"{prefix}=>{msg}")
