import { VisualPicker } from "@/components/ui/visual-picker";
import Link from "next/link";

export default function Home() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <Link href="/admin">
                    <VisualPicker size="lg" variant="outline">
                        <p className="font-semibold tracking-tight text-3xl">
                            Enter Railsurvey Admin Demo
                        </p>
                    </VisualPicker>
                </Link>
            </main>
            <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
                <p className="text-ms font-mono font-light">
                    Copyright: Maciej Kilijański, 2025
                </p>
            </footer>
        </div>
    );
}
