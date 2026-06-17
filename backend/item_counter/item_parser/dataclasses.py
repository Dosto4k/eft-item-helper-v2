from dataclasses import dataclass


@dataclass
class QuestsLinks:
    name: str
    seo_link: str


@dataclass
class QuestData:
    name: str
    guide: str


@dataclass
class ItemData:
    name: str
    count: int
    in_raid: int
    out_raid: int
    quests: list[QuestData]
