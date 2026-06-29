from dataclasses import dataclass


@dataclass
class QuestCountProgressData:
    total: int
    completed: int
    in_raid_completed: int
    out_raid_completed: int
    progress: float
    in_progress: int
