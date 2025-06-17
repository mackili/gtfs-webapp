"use client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type SelectToPathValue = {
    label: string;
    value: string | number | boolean;
    default?: boolean;
};
export default function SelectToPath({
    values,
    className,
    placeholder,
    paramKey,
    disabled,
}: {
    values: SelectToPathValue[];
    className?: string;
    placeholder?: string;
    label?: string;
    paramKey: string;
    disabled?: boolean;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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

    const handleChange = (value: string) => {
        const qs = createQueryString({
            [paramKey]: value,
        });
        router.replace(`${pathname}?${qs}`);
    };
    return (
        <Select
            onValueChange={handleChange}
            defaultValue={
                values
                    .filter((value) => value.default === true)[0]
                    ?.value.toString() || undefined
            }
            disabled={disabled}
        >
            <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {values.map((value, index) => (
                    <SelectItem
                        key={index}
                        value={
                            typeof value.value !== "string"
                                ? value.value.toString()
                                : value.value
                        }
                    >
                        {value.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
