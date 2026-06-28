from rest_framework import serializers

from item_counter.models import Quest, UserItem


class QuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quest
        fields = ["name", "guide"]


class CountQuestItemSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="item.name", read_only=True)
    required_in_raid = serializers.IntegerField(
        source="item.quest_details.in_raid", read_only=True
    )
    required_out_raid = serializers.IntegerField(
        source="item.quest_details.out_raid", read_only=True
    )
    collect_in_raid = serializers.IntegerField(source="quest_in_raid", read_only=True)
    collect_out_raid = serializers.IntegerField(source="quest_out_raid", read_only=True)
    quests = QuestSerializer(many=True, read_only=True, source="item.quests")

    class Meta:
        model = UserItem
        fields = [
            "name",
            "required_in_raid",
            "required_out_raid",
            "collect_in_raid",
            "collect_out_raid",
            "quests",
        ]
