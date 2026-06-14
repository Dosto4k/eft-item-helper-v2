from pathlib import Path

QUEST_SOURCES = {
    "prapor": "Прапор",
    "therapist": "Терапевт",
    "fence": "Скупщик",
    "skier": "Лыжник",
    "peacemaker": "Миротворец",
    "mechanic": "Механик",
    "ragman": "Барахольщик",
    "jaeger": "Егерь",
    "lightkeeper": "Смотритель",
    "ref": "Реф",
    "btr_driver": "Водитель БТР",
    "storyteller": "Сюжет",
}

API_QUEST_SOURCE_URL = "https://api.tarkov.help/api/ru/quests/trader/"
API_QUEST_URL = "https://api.tarkov.help/api/ru/quests/"
QUEST_GUIDE_URL = "https://tarkov.help/ru/quest/"

BASE_DIR = Path(__file__).parent.parent
RESULT_DIR = BASE_DIR / "result"
RESULT_DIR.mkdir(exist_ok=True, parents=True)
RESULT_FILE = "items.json"
RESULT_PATH = RESULT_DIR / RESULT_FILE
