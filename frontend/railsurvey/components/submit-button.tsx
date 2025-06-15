"use client";
import { Button } from "./ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function SubmitFormButton({
    variant,
    disabled = false,
    text = "Submit",
    size = "default",
}: {
    variant:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link";
    disabled?: boolean;
    text?: string;
    size?: "default" | "sm" | "lg";
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    console.log(disabled);

    const handleSubmit = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.append("submitted", "true");
        router.replace(`${pathname}?${params.toString()}`);
    };
    return (
        <Button
            className="cursor-pointer"
            variant={variant}
            disabled={disabled}
            size={size}
            onClick={handleSubmit}
        >
            {text}
        </Button>
    );
}
