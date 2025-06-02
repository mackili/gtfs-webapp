import { twMerge } from "tailwind-merge";

export function H1({ text }: { text: string }) {
  return (
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
      {text}
    </h1>
  );
}
export function H2({ text, className }: { text: string; className?: string }) {
  return (
    <h2
      className={twMerge(
        "scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className
      )}
    >
      {text}
    </h2>
  );
}
export function H3({ text }: { text: string }) {
  return (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
      {text}
    </h3>
  );
}
export function H4({ text }: { text: string }) {
  return (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{text}</h4>
  );
}
export function P({ text }: { text: string }) {
  return <p className="leading-7 [&:not(:first-child)]:mt-6">{text}</p>;
}
export function Blockquote({ text }: { text: string }) {
  return (
    <blockquote className="mt-6 border-l-2 pl-6 italic">{text}</blockquote>
  );
}
export function InlineCode({ text }: { text: string }) {
  return (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      {text}
    </code>
  );
}
export function TypographyLead({ text }: { text: string }) {
  return <p className="text-xl text-muted-foreground">{text}</p>;
}
export function Large({ text }: { text: string }) {
  return <div className="text-lg font-semibold">{text}</div>;
}
export function Small({ text }: { text: string }) {
  return <small className="text-sm font-medium leading-none">{text}</small>;
}
export function Muted({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}
