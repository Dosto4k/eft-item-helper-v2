from typing import Any

from django.db.models import QuerySet
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from item_counter.models import Item, UserItem
from item_counter.serializers import CountQuestItemSerializer
from item_counter.validators import (
    ACTION_DECREMENT,
    ACTION_INCREMENT,
    check_quest_count_limits,
    item_action_param_validator,
)
from query_params.mixins import QueryParamsMixin
from query_params.types import QueryParams


class QuestItemCountActionView(QueryParamsMixin, APIView):
    permission_classes = (IsAuthenticated,)
    http_method_names = ["patch"]
    query_params = {
        "in_raid": bool,
        "action": str,
    }
    query_params_validators = {
        "action": [item_action_param_validator],
    }
    required_query_params = ("action", "in_raid")

    def get_object(self) -> UserItem:
        user = self.request.user
        item_pk = self.kwargs["pk"]
        try:
            obj = get_object_or_404(
                UserItem.objects.select_related("item__quest_details"),
                user=user,
                item__pk=item_pk,
                item__quest_details__isnull=False,
            )
        except Http404 as err:
            raise Http404(
                f"Нет объектов '{Item._meta.object_name}' удовлетворяющих запросу."
            ) from err
        return obj

    def patch(self, request: Request, *args: Any, **kwargs: Any) -> Response:  # noqa:ANN401,ARG002
        obj = self.get_object()
        query_params = self.get_query_params(request.query_params)
        in_raid = query_params["in_raid"]
        delta = self.get_count_delta(query_params)
        check_quest_count_limits(obj, in_raid, delta)
        obj.action_quest_count(in_raid, delta)
        return Response({"success": True}, status=status.HTTP_200_OK)

    def get_count_delta(self, query_params: QueryParams) -> int:
        """
        На основе query-параметра 'action' ('increment'/'decrement')
        возвращает число (1/-1), на которое нужно изменить кол-во
        найденных предметов
        """
        action = query_params["action"]
        if action == ACTION_INCREMENT:
            delta = 1
        elif action == ACTION_DECREMENT:
            delta = -1
        return delta


class UserQuestItemsCountView(ListAPIView):
    serializer_class = CountQuestItemSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self) -> QuerySet[UserItem]:
        return (
            UserItem.objects.filter(user=self.request.user)
            .select_related(
                "item",
                "item__quest_details",
            )
            .prefetch_related("item__quests")
        )
