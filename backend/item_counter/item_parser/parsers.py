import logging
from collections import defaultdict
from time import sleep

from tqdm import tqdm

from item_counter.item_parser.common import get_json_response
from item_counter.item_parser.config import (
    API_QUEST_SOURCE_URL,
    API_QUEST_URL,
    QUEST_GUIDE_URL,
    QUEST_SOURCES,
)
from item_counter.item_parser.dataclasses import ItemData, QuestData, QuestsLinks

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")


class QuestSourcesParser:
    def __init__(self) -> None:
        self.quest_sources = QUEST_SOURCES.keys()
        self.api_quest_source_url = API_QUEST_SOURCE_URL

    def get_result(self) -> dict[str, list[QuestsLinks]]:
        quests: dict[str, list[QuestsLinks]] = defaultdict(list)
        logger.info("Получаем ссылки на квесты")
        for trader in tqdm(self.quest_sources):
            sleep(0.5)
            url = f"{self.api_quest_source_url}{trader}"
            response = get_json_response(url=url)
            for raw_quest in response["data"]:
                quests[trader].append(
                    QuestsLinks(
                        name=raw_quest["name"],
                        seo_link=raw_quest["seo_link"],
                    )
                )
        return quests


class QuestParser:
    def __init__(self, quest_links: dict[str, list[QuestsLinks]]) -> None:
        self.items: dict[str, ItemData] = {}
        self.quest_links = quest_links
        self.guide_url = QUEST_GUIDE_URL
        self.api_quest_url = API_QUEST_URL

    def get_item(self, name: str) -> ItemData:
        item = self.items.get(name)
        if item is None:
            item = ItemData(
                name=name,
                count=0,
                in_raid=0,
                out_raid=0,
                quests=[],
            )
        return item

    def get_result(self) -> list[ItemData]:
        logger.info("Парсим квесты")
        for source, quests_links in self.quest_links.items():
            logger.info(f"Источник квестов: {QUEST_SOURCES[source]}")
            for quest_link in tqdm(quests_links):
                sleep(0.5)
                url = f"{self.api_quest_url}{quest_link.seo_link}"
                response = get_json_response(url)
                item_goals = response["data"]["item_goals"]
                for item_goal in item_goals:
                    name = item_goal["item"]["name"]
                    count = item_goal["count"]
                    found_in_raid = item_goal["found_in_raid"]
                    in_raid = count if found_in_raid else 0
                    out_raid = count if not found_in_raid else 0
                    item = self.get_item(name=name)
                    item.in_raid += in_raid
                    item.out_raid += out_raid
                    item.count += count
                    quest = QuestData(
                        name=quest_link.name,
                        guide=f"{self.guide_url}{quest_link.seo_link}",
                    )
                    item.quests.append(quest)
                    self.items[name] = item
        return [item for item in self.items.values()]
