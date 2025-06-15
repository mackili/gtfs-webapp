"use client";

import { TemplateQuestion } from "@/types/surveys";
import { Input } from "./ui/input";
// import { useForm } from "react-hook-form";
// import {
//     Form,
//     FormControl,
//     FormDescription,
//     FormField,
//     FormItem,
//     FormLabel,
// } from "@/components/ui/form";
// import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Select } from "./ui/select";

export default function QuestionRender({
    question,
    errorIds = [],
}: {
    question: TemplateQuestion;
    errorIds?: string[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isError, setError] = useState<boolean>(
        errorIds.includes(question.id.toString())
    );
    useEffect(() => {}, [isError]);

    const createQueryString = useCallback(
        (paramsObj: Record<string, string | string[]>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(paramsObj).forEach(([key, value]) => {
                params.set(key, value.toString());
            });
            return params.toString();
        },
        [searchParams]
    );

    const validateValue = (input: {
        newValue: string | number | boolean | undefined;
        maxValue?: string | number | undefined;
        minValue?: string | number | undefined;
        required?: boolean;
    }) => {
        let valid = true;
        if (Number(input.newValue)) {
            const numericValue = Number(input.newValue);
            valid =
                numericValue >= (Number(input.minValue) || numericValue) &&
                numericValue <= (Number(input.maxValue) || numericValue);
        }
        if (input.required === true) {
            valid = (input.newValue || "").toString().length > 0;
        }
        setError(!valid);
        let localErrorIds = errorIds;
        if (valid === true) {
            localErrorIds = errorIds.filter(
                (errorId) => errorId !== question.id.toString()
            );
        } else {
            if (!errorIds.includes(question.id.toString())) {
                localErrorIds.push(question.id.toString());
            }
        }
        console.log(localErrorIds);
        return { valid, localErrorIds };
    };

    const handleValueChange = (input: {
        newValue: string | number | boolean | undefined;
        maxValue?: string | number | undefined;
        minValue?: string | number | undefined;
        required?: boolean;
    }) => {
        const { localErrorIds } = validateValue(input);
        const qs = createQueryString({
            [question.id.toString()]: input.newValue?.toString() || "",
            errorIds: localErrorIds,
        });
        router.replace(`${pathname}?${qs}`);
    };

    const renderAnswerInput = () => {
        switch (question.answerFormat) {
            case "checkbox":
                return <Input type="checkbox" />;
            case "select":
                return <Select></Select>;
            default:
                return (
                    <Input
                        id={question.id.toString()}
                        onChange={(e) =>
                            handleValueChange({
                                newValue: e.target.value,
                                maxValue: e.target.max,
                                minValue: e.target.min,
                                required: e.target.required,
                            })
                        }
                        required={question.isRequired}
                        type={question.answerFormat}
                        max={question.maxValue}
                        min={question.minValue}
                        className={
                            isError === true
                                ? "border-red-600 focus-visible:border-red-600 focus-visible:ring-red-300"
                                : ""
                        }
                    ></Input>
                );
        }
    };

    return (
        <div className="flex flex-col flex-nowrap gap-4 py-6">
            <Label htmlFor={question.id.toString()} className="gap-1">
                {question.text}
                {question.isRequired && <span className="text-red-600">*</span>}
            </Label>
            {renderAnswerInput()}
        </div>
    );
}
