"use client";
import {
    SurveyTemplate,
    TemplateSection,
    TemplateQuestion,
    Author,
    htmlInputTypes,
    TemplateSummary,
} from "@/types/surveys";
import { H2, H3, H4 } from "./ui/typography";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Button } from "./ui/button";
import { MinusCircle } from "lucide-react";
import { formdataToSurveyTemplate } from "@/functions/formdataJson";
import { upsertSurveyTemplate } from "@/functions/dbQuery";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";

interface TemplateCreatorProps extends React.ComponentProps<"div"> {
    data?: TemplateSummary;
}

export enum TemplateSectionId {
    TemplateInfo = "templateInfo",
    TemplateSections = "templateSections",
    QuestionsInfo = "templateQuestions",
    Authors = "authors",
}
const creatorForm: TemplateSummary = {
    id: 0,
    title: "Survey Template",
    type: "webapp",
    templateSections: [
        {
            id: TemplateSectionId.TemplateInfo,
            title: "Survey Template Information",
            surveyTemplateId: 0,
            displayOrder: 0,
            displayNextPage: false,
            hasRepeater: false,
        },
        {
            id: TemplateSectionId.TemplateSections,
            title: "Survey Template Sections",
            surveyTemplateId: 0,
            displayOrder: 10,
            displayNextPage: false,
            hasRepeater: true,
        },
        {
            id: TemplateSectionId.QuestionsInfo,
            title: "Survey Template Questions",
            displayOrder: 20,
            surveyTemplateId: 0,
            displayNextPage: false,
            hasRepeater: true,
        },
    ],
    templateQuestions: [
        {
            id: "title",
            text: "Survey Title",
            displayOrder: 0,
            answerFormat: "text",
            surveyTemplateId: 0,
            templateSectionId: "templateInfo",
            isRequired: true,
            description: "Unique title saved to the database",
        },
        {
            id: "displayTitle",
            text: "Displayed Title",
            displayOrder: 10,
            answerFormat: "text",
            surveyTemplateId: 0,
            templateSectionId: "templateInfo",
            isRequired: false,
            description: "Title displayed to final users",
        },
        {
            id: "description",
            text: "Description",
            displayOrder: 20,
            answerFormat: "text",
            surveyTemplateId: 0,
            templateSectionId: "templateInfo",
            isRequired: false,
            description: "Optional description of the survey template",
        },
        {
            id: "type",
            text: "Survey Type",
            displayOrder: 30,
            answerFormat: "text",
            surveyTemplateId: 0,
            templateSectionId: "templateInfo",
            isRequired: true,
            description: "aaa",
        },
        {
            id: "title",
            text: "Section Title",
            displayOrder: 0,
            answerFormat: "text",
            surveyTemplateId: 0,
            templateSectionId: "templateSections",
            isRequired: false,
        },
        {
            id: "order",
            text: "Display Order",
            displayOrder: 10,
            answerFormat: "number",
            surveyTemplateId: 0,
            templateSectionId: "templateSections",
            isRequired: false,
        },
        {
            id: "description",
            text: "Description",
            displayOrder: 20,
            answerFormat: "text",
            surveyTemplateId: 0,
            templateSectionId: "templateSections",
            isRequired: false,
        },
        {
            id: "displayNextPage",
            text: "Display on next page",
            displayOrder: 30,
            answerFormat: "select",
            selectValues: ["true", "false"],
            surveyTemplateId: 0,
            templateSectionId: "templateSections",
            isRequired: false,
        },
        {
            id: "text",
            text: "Question Text",
            displayOrder: 0,
            answerFormat: "text",
            surveyTemplateId: 0,
            templateSectionId: "templateQuestions",
            isRequired: true,
        },
        {
            id: "description",
            text: "Question Description",
            displayOrder: 10,
            answerFormat: "text",
            surveyTemplateId: 0,
            templateSectionId: "templateQuestions",
            isRequired: false,
        },
        {
            id: "displayOrder",
            text: "Display Order",
            displayOrder: 20,
            answerFormat: "number",
            surveyTemplateId: 0,
            templateSectionId: "templateQuestions",
            isRequired: true,
        },
        {
            id: "externalSectionId",
            text: "Section",
            displayOrder: 30,
            answerFormat: "select",
            selectValues: ["temp"],
            surveyTemplateId: 0,
            templateSectionId: "templateQuestions",
            isRequired: false,
        },
        {
            id: "answerFormat",
            text: "Answer Format",
            displayOrder: 40,
            answerFormat: "select",
            // @ts-expect-error this is a constant
            selectValues: htmlInputTypes,
            surveyTemplateId: 0,
            templateSectionId: "templateQuestions",
            isRequired: true,
            description: "text, number of range",
        },
        {
            id: "isRequired",
            text: "Required?",
            displayOrder: 50,
            answerFormat: "select",
            selectValues: ["true", "false"],
            surveyTemplateId: 0,
            templateSectionId: "templateQuestions",
            isRequired: true,
            description: "true or false",
        },
        {
            id: "firstName",
            text: "First Name",
            displayOrder: 0,
            answerFormat: "text",
            surveyTemplateId: 0,
            templateSectionId: "authors",
            isRequired: true,
        },
        {
            id: "lastName",
            text: "Last Name",
            displayOrder: 10,
            answerFormat: "text",
            surveyTemplateId: 0,
            templateSectionId: "authors",
            isRequired: true,
        },
        {
            id: "institution",
            text: "Institution",
            displayOrder: 20,
            answerFormat: "text",
            surveyTemplateId: 0,
            templateSectionId: "authors",
            isRequired: false,
        },
    ],
} as const;

const pushToArray = (
    newValue: Author | TemplateSection | TemplateQuestion | number,
    oldArray: Author[] | TemplateSection[] | TemplateQuestion[] | number[]
) => {
    const newArray = [...oldArray];
    newArray.push(newValue);
    return newArray as
        | Author[]
        | TemplateSection[]
        | TemplateQuestion[]
        | number[];
};

const removeFromArray = (
    array: Author[] | TemplateSection[] | TemplateQuestion[] | number[],
    id: number
) => {
    return array.filter((item) => {
        if (typeof item === "number") {
            return item !== id; // For primitive numbers, compare directly
        }
        return item.id !== id;
    });
};
export default function TemplateCreator({ data }: TemplateCreatorProps) {
    const router = useRouter();
    const [templateData, setTemplateData] =
        useState<TemplateSummary>(creatorForm);
    const [updatedData, setUpdatedData] = useState<TemplateSummary>({});
    const [sectionsArray, setSectionsArray] = useState<number[]>([]);
    const [authorsArray, setAuthorsArray] = useState<number[]>([]);
    const [questionsArray, setQuestionsArray] = useState<number[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState<false | string>(false);

    const getArrayForSection = (sectionId: TemplateSectionId) => {
        switch (sectionId) {
            case "templateSections":
                return sectionsArray;
            case "templateQuestions":
                return questionsArray;
            default:
                return authorsArray;
        }
    };

    const handleNewItem = (sectionId: TemplateSectionId | string) => {
        switch (sectionId) {
            case "templateSections":
                setSectionsArray(
                    pushToArray(Date.now(), sectionsArray) as number[]
                );
                break;
            case "templateQuestions":
                setQuestionsArray(
                    pushToArray(Date.now(), questionsArray) as number[]
                );
                console.log(questionsArray);
                break;
            case "authors":
                setAuthorsArray(
                    pushToArray(Date.now(), authorsArray) as number[]
                );
            default:
                break;
        }
    };

    const handleRemoveItem = (
        sectionId: TemplateSectionId | string,
        elementId: number
    ) => {
        switch (sectionId) {
            case "templateSections":
                setSectionsArray(
                    removeFromArray(sectionsArray, elementId) as number[]
                );
                break;
            case "templateQuestions":
                setQuestionsArray(
                    removeFromArray(questionsArray, elementId) as number[]
                );
                break;
            case "authors":
                setAuthorsArray(
                    removeFromArray(authorsArray, elementId) as number[]
                );
            default:
                break;
        }
    };

    useEffect(() => {
        if (!data) {
            return;
        }
        setTemplateData(data);
    }, [data]);

    const form = useForm();

    function onsubmit(values: object) {
        console.log(values);
        setUpdatedData(formdataToSurveyTemplate(values));
    }

    useEffect(() => {
        const upsertData = async () => {
            setLoading(true);
            const result = await upsertSurveyTemplate(updatedData);
            setError(result.isSuccess ? false : result.errorMessage || "");
            console.log(result);
            if (
                result.isSuccess &&
                result.data &&
                (result.data as TemplateSummary)
            ) {
                router.push(
                    `/admin/surveys/${(result.data as TemplateSummary).id}`
                );
            }
            setLoading(false);
        };
        if (Object.keys(updatedData).length > 0) {
            upsertData();
        }
    }, [updatedData]);

    return (
        <div className="flex w-full flex-nowrap flex-col m-8">
            <H2 text="Create a new Survey Template" />
            <div
                className={twMerge(
                    "flex transition-all",
                    isLoading ? "opacity-20" : ""
                )}
            >
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onsubmit)}
                        className="grid w-full md:grid-cols-3 my-8 gap-4"
                    >
                        <div className="md:col-span-2 transition-all hover:bg-accent/10 hover:text-accent-foreground rounded-md p-4 has-[>svg]:px-4 flex flex-col border bg-background shadow-xs">
                            {templateData.templateSections !== undefined
                                ? templateData.templateSections
                                      .sort(
                                          (a, b) =>
                                              a.displayOrder - b.displayOrder
                                      )
                                      .map((section) => (
                                          <section
                                              key={section.id}
                                              className="my-4 pb-8 border-b-2 border-accent"
                                          >
                                              <H3 text={section.title || ""} />
                                              <div className="mt-4 grid gap-4">
                                                  {(section.hasRepeater
                                                      ? getArrayForSection(
                                                            section.id as TemplateSectionId
                                                        )
                                                      : [0]
                                                  ).map((item, index) => (
                                                      <div
                                                          key={index}
                                                          className="md:grid-cols-2 pb-4 grid gap-4 border-b border-secondary "
                                                      >
                                                          {section.hasRepeater ? (
                                                              <div className="flex col-span-full align-middle justify-between">
                                                                  <H4
                                                                      text={`${
                                                                          section.title
                                                                      } ${
                                                                          index +
                                                                          1
                                                                      }`}
                                                                      className="h-8 align-middle"
                                                                  />
                                                                  <Button
                                                                      variant="ghost"
                                                                      size="sm"
                                                                      onClick={() =>
                                                                          handleRemoveItem(
                                                                              section.id as TemplateSectionId,
                                                                              item
                                                                          )
                                                                      }
                                                                      className="cursor-pointer"
                                                                      type="button"
                                                                  >
                                                                      <MinusCircle />
                                                                  </Button>
                                                              </div>
                                                          ) : null}
                                                          {templateData.templateQuestions !==
                                                          undefined
                                                              ? templateData.templateQuestions
                                                                    .filter(
                                                                        (a) =>
                                                                            a.templateSectionId ===
                                                                            section.id
                                                                    )
                                                                    .sort(
                                                                        (
                                                                            a,
                                                                            b
                                                                        ) =>
                                                                            a.displayOrder -
                                                                            b.displayOrder
                                                                    )
                                                                    .map(
                                                                        (
                                                                            question
                                                                        ) => (
                                                                            <FormField
                                                                                key={`${item}:${question.id}`}
                                                                                control={
                                                                                    form.control
                                                                                }
                                                                                name={`${section.id.toString()}:${item.toString()}:${question.id.toString()}`}
                                                                                render={({
                                                                                    field,
                                                                                }) => (
                                                                                    <FormItem className="flex flex-col flex-nowrap items-start">
                                                                                        <FormLabel>
                                                                                            {
                                                                                                question.text
                                                                                            }
                                                                                        </FormLabel>
                                                                                        {question.answerFormat ===
                                                                                        "select" ? (
                                                                                            <Select
                                                                                                onValueChange={
                                                                                                    field.onChange
                                                                                                }
                                                                                                defaultValue={
                                                                                                    field.value
                                                                                                }
                                                                                            >
                                                                                                <FormControl>
                                                                                                    <SelectTrigger className="w-full">
                                                                                                        <SelectValue />
                                                                                                    </SelectTrigger>
                                                                                                </FormControl>
                                                                                                <SelectContent>
                                                                                                    {question.selectValues?.map(
                                                                                                        (
                                                                                                            selectVal,
                                                                                                            index
                                                                                                        ) => (
                                                                                                            <SelectItem
                                                                                                                value={
                                                                                                                    selectVal
                                                                                                                }
                                                                                                                key={
                                                                                                                    index
                                                                                                                }
                                                                                                            >
                                                                                                                {
                                                                                                                    selectVal
                                                                                                                }
                                                                                                            </SelectItem>
                                                                                                        )
                                                                                                    )}
                                                                                                </SelectContent>
                                                                                            </Select>
                                                                                        ) : (
                                                                                            <FormControl>
                                                                                                <Input
                                                                                                    type={
                                                                                                        question.answerFormat
                                                                                                    }
                                                                                                    {...field}
                                                                                                ></Input>
                                                                                            </FormControl>
                                                                                        )}
                                                                                        <FormDescription>
                                                                                            {
                                                                                                question?.description
                                                                                            }
                                                                                        </FormDescription>
                                                                                    </FormItem>
                                                                                )}
                                                                            ></FormField>
                                                                        )
                                                                    )
                                                              : null}
                                                      </div>
                                                  ))}
                                                  {section.hasRepeater ? (
                                                      <Button
                                                          variant="secondary"
                                                          onClick={() =>
                                                              handleNewItem(
                                                                  section.id as TemplateSectionId
                                                              )
                                                          }
                                                          className="cursor-pointer col-span-full"
                                                          type="button"
                                                      >{`Add ${section.title}`}</Button>
                                                  ) : null}
                                              </div>
                                          </section>
                                      ))
                                : ""}
                            <Button
                                type="submit"
                                variant={
                                    error !== false ? "destructive" : "default"
                                }
                                className="cursor-pointer"
                            >
                                Submit
                            </Button>
                        </div>
                        <div className="md:col-span-1 transition-all hover:bg-accent/10 hover:text-accent-foreground rounded-md p-4 has-[>svg]:px-4 flex flex-col border bg-background shadow-xs">
                            {getArrayForSection(
                                "authors" as TemplateSectionId
                            ).map((item, index) => (
                                <div
                                    key={index}
                                    className="mt-6 pb-2 border-b border-secondary grid gap-4"
                                >
                                    <div className="flex align-middle justify-between">
                                        <H4
                                            text={`Author ${index + 1}`}
                                            className="h-8 align-middle"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleRemoveItem(
                                                    "authors",
                                                    item
                                                )
                                            }
                                            type="button"
                                            className="cursor-pointer"
                                        >
                                            <MinusCircle />
                                        </Button>
                                    </div>
                                    {templateData.templateQuestions !==
                                    undefined
                                        ? templateData.templateQuestions
                                              .filter(
                                                  (a) =>
                                                      a.templateSectionId ===
                                                      "authors"
                                              )
                                              .sort(
                                                  (a, b) =>
                                                      a.displayOrder -
                                                      b.displayOrder
                                              )
                                              .map((question) => (
                                                  <FormField
                                                      key={`${item}:${question.id}`}
                                                      control={form.control}
                                                      name={`authors:${item.toString()}:${question.id.toString()}`}
                                                      render={({ field }) => (
                                                          <FormItem className="flex flex-col flex-nowrap items-start">
                                                              <FormLabel>
                                                                  {
                                                                      question.text
                                                                  }
                                                              </FormLabel>
                                                              <FormControl>
                                                                  <Input
                                                                      type={
                                                                          question.answerFormat
                                                                      }
                                                                      {...field}
                                                                  ></Input>
                                                              </FormControl>
                                                              <FormDescription>
                                                                  {
                                                                      question?.description
                                                                  }
                                                              </FormDescription>
                                                          </FormItem>
                                                      )}
                                                  ></FormField>
                                              ))
                                        : null}
                                </div>
                            ))}
                            <Button
                                variant="secondary"
                                onClick={() => handleNewItem("authors")}
                                className="mt-6 cursor-pointer"
                                type="button"
                            >
                                Add Author
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
