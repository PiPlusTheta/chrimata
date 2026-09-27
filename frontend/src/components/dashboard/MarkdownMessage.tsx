import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownMessage({ text }: { text: string }) {
  return (
    <div className="ask-markdown text-[15px] leading-relaxed text-text-primary">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
        a: ({ href, children }) => href && /^https?:\/\//i.test(href)
          ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-bronze underline underline-offset-2">{children}</a>
          : <span>{children}</span>,
        code: ({ children, className }) => <code className={className || "rounded bg-accent-surface px-1 py-0.5 font-mono text-[.85em] text-bronze"}>{children}</code>,
      }}>{text}</ReactMarkdown>
    </div>
  );
}
