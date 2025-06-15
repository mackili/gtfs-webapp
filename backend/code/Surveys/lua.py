from lupa.lua54 import LuaRuntime
import re
from classes import SubmittedAnswer

lua = LuaRuntime()
REGEX_QUESTION = r"\b\w+\[([^\[\]]+)\]"


def evaluate(function_string: str, data: dict[str | int, list[int]]) -> float:
    lua_func = lua.eval(function_string)
    return lua_func(data)


def extract_question_ids(function_string) -> set[str]:
    return set(re.findall(REGEX_QUESTION, function_string))


def create_answer_list_dict(
    answers: list[SubmittedAnswer],
) -> dict[str | int, list[int]]:
    result = {}
    for answer in answers:
        if answer.templateQuestionId not in result.keys():
            result[answer.templateQuestionId] = [answer.value]
        else:
            result[answer.templateQuestionId].append(answer.value)
    return result
