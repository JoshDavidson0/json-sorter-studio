import { useMemo } from "react";

interface JsonHighlighterProps {
  json: string;
}

const JsonHighlighter = ({ json }: JsonHighlighterProps) => {
  const highlighted = useMemo(
    () =>
      json.replace(
        /("(?:\\.|[^"\\])*")\s*:|("(?:\\.|[^"\\])*")|([-+]?\d+\.?\d*(?:[eE][-+]?\d+)?)|(\btrue\b|\bfalse\b)|(\bnull\b)|([[\]{}])|([,])/g,
        (m, key, str, num, bool, nul, bracket, comma) => {
          if (key) return `<span class="json-key">${key}</span>:`;
          if (str) return `<span class="json-string">${str}</span>`;
          if (num) return `<span class="json-number">${num}</span>`;
          if (bool) return `<span class="json-boolean">${bool}</span>`;
          if (nul) return `<span class="json-null">${nul}</span>`;
          if (bracket) return `<span class="json-bracket">${bracket}</span>`;
          if (comma) return `<span class="json-comma">${comma}</span>`;
          return m;
        }
      ),
    [json]
  );

  return (
    <pre className="font-mono text-sm leading-relaxed whitespace-pre overflow-auto">
      <code dangerouslySetInnerHTML={{ __html: highlighted }} />
    </pre>
  );
};

export default JsonHighlighter;
