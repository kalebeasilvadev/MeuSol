from django.conf import settings
from datetime import datetime, timedelta

data = datetime.now().strftime("%Y-%m-%d")
filename = f"logs/automacao/automacao.log"

LOGTAIL_FILES = {
    'automacao': filename,
}
LOGTAIL_UPDATE_INTERVAL = 100 # Default is 3000 (three second)