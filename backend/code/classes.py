from pydantic import BaseModel, AnyUrl, RootModel
from typing import List, Optional, Dict, Union, Any


class GTFSRT_Options(BaseModel):
    tripUpdates: AnyUrl | None = None
    vehiclePositions: AnyUrl | None = None
    alerts: AnyUrl | None = None
    batchSize: int | None = None
    verbose: bool = False
    write: bool = False


class GTFSRT_Response(BaseModel):
    alerts: list
    tripUpdates: list
    vehiclePositions: list


class SurveyTemplate(BaseModel):
    id: str | int | None = None
    title: str
    displayTitle: str | None = None
    description: str | None = None
    type: str


class Author(BaseModel):
    id: Optional[str | int] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    institutionName: Optional[str] = None


class SurveyTemplateAuthor(BaseModel):
    authorId: str | int
    surveyTemplateId: str | int
    displayOrder: int | None = None


class TemplateSection(BaseModel):
    id: str | int | None = None
    surveyTemplateId: int | str | None = None
    displayOrder: int
    title: str | None = None
    description: str | None = None
    displayNextPage: bool = False
    externalId: Optional[str | int] = None


class TemplateQuestion(BaseModel):
    id: str | int | None = None
    surveyTemplateId: int | str | None = None
    displayOrder: int
    text: str
    description: str | None = None
    templateSectionId: int | str | None = None
    answerFormat: str
    selectValues: list[str | None] | None = None
    isRequried: bool = False
    externalSectionId: Optional[str | int] = None


class TemplateSummary(SurveyTemplate):
    surveyTemplateAuthors: Optional[list[Author]] = None
    templateSections: Optional[list[TemplateSection]] = None
    templateQuestions: Optional[list[TemplateQuestion]] = None


class UpsertInput(RootModel[Dict[Union[str, int], Any]]):
    pass


class SurveySubmission(BaseModel):
    id: Optional[int]
    surveyId: int
    tripId: Optional[int]
    tickerHash: Optional[str]
    timestamp: Optional[int]


class SubmittedAnswer(BaseModel):
    id: Optional[int]
    submissionId: int
    templateQuestionId: int
    value: str | int | None


class SurveySubmissionSummary(SurveySubmission):
    answers: List[SubmittedAnswer]
