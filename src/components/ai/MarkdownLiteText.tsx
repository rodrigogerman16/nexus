/** Renders "**bold**" segments as <strong> without ever touching innerHTML —
 * AI response text can embed arbitrary user-entered task/project/note
 * titles, so this must stay pure React (auto-escaped), never
 * dangerouslySetInnerHTML. */
export function MarkdownLiteText({ text, className }: { text: string; className?: string }) {
  return (
    <p className={className}>
      {text.split(/(\*\*.+?\*\*)/g).map((chunk, i) =>
        chunk.startsWith("**") && chunk.endsWith("**") ? (
          <strong key={i}>{chunk.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{chunk}</span>
        )
      )}
    </p>
  );
}
