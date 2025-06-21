from pydantic import BaseModel, AnyUrl, RootModel, model_validator, HttpUrl
from typing import List, Optional, Dict, Union, Any


class GTFSRT_Options(BaseModel):
    url: AnyUrl
    batchSize: int | None = 200
    verbose: bool = False
    write: bool = False


class GTFS_Upload_Response(BaseModel):
    success: bool = True
    error: Optional[Dict] = None


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
    isRequired: bool = False
    # externalSectionId: Optional[str | int] = None
    maxValue: int | None = None
    minValue: int | None = None


class TemplateSummary(SurveyTemplate):
    surveyTemplateAuthors: Optional[list[Author]] = None
    templateSections: Optional[list[TemplateSection]] = None
    templateQuestions: Optional[list[TemplateQuestion]] = None


class UpsertInput(RootModel[Dict[Union[str, int], Any]]):
    pass


class SurveySubmission(BaseModel):
    id: Optional[int] = None
    surveyId: int
    routeId: Optional[int | str] = None
    tripId: Optional[int | str] = None
    ticketHash: Optional[str] = None
    timestamp: Optional[str] = None
    uuid: Optional[str] = None


class SubmittedAnswer(BaseModel):
    id: Optional[int] = None
    submissionId: Optional[int] = None
    templateQuestionId: int
    value: str | int | None
    uuid: Optional[str] = None


class CompositeSubmission(SurveySubmission):
    answers: List[SubmittedAnswer]


class ServiceAspectFormula(BaseModel):
    id: Optional[int] = None
    surveyTemplateId: int
    serviceAspectId: int
    weight: float
    formula: str
    serviceAspectTitle: Optional[str] = None


class ServiceAspectResultError(BaseModel):
    errorMessage: str
    errorDetails: Optional[object] = None


class ServiceAspectResult(BaseModel):
    formulaId: int | str
    serviceAspectId: int | str
    serviceAspectTitle: Optional[str]
    value: float | str | None | ServiceAspectResultError
    questionIds: List[int | str]
    calculationTime: int


class QueryResult(BaseModel):
    totalSize: int
    itemsStart: int
    itemsEnd: int
    items: List[Any]


class ServiceAspectReadResult(QueryResult):
    items: List[ServiceAspectResult]


class ServiceAspectCalculationInputBody(BaseModel):
    tripId: Optional[List[str]] = None
    routeId: Optional[List[str]] = None


class RealtimeSourceAgency(BaseModel):
    id: Optional[str | int] = None
    realtimeSourceId: Optional[str | int] = None
    agencyId: str | int
    uuid: Optional[str] = None


class RealtimeSource(BaseModel):
    id: Optional[str | int] = None
    url: Optional[str] = None
    write: bool
    verbose: bool
    batchSize: int = 200
    active: bool = False
    refreshPeriod: int | None = None


class RealtimeSourceResult(RealtimeSource):
    agencies: List[RealtimeSourceAgency]
