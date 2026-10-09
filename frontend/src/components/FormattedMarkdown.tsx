import React from 'react';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({
  content,
  className = '',
  isUser = false
}) => {
  if (!content) return null;

  const lines = content.split('\n');

  const renderInline = (text: string) => {
    const parts: (string | React.ReactNode)[] = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const raw = match[0];
      if (raw.startsWith('**') && raw.endsWith('**')) {
        const inner = raw.slice(2, -2);
        parts.push(
          <strong
            key={match.index}
            className={isUser ? 'font-bold text-white' : 'font-semibold text-gray-900'}
          >
            {inner}
          </strong>
        );
      } else if (raw.startsWith('`') && raw.endsWith('`')) {
        const inner = raw.slice(1, -1);
        parts.push(
          <code
            key={match.index}
            className={'px-1 py-0.5 rounded text-xs font-mono ' + (isUser ? 'bg-white/20 text-white' : 'bg-gray-100 text-teal-800')}
          >
            {inner}
          </code>
        );
      } else if (raw.startsWith('*') && raw.endsWith('*')) {
        const inner = raw.slice(1, -1);
        parts.push(
          <em key={match.index} className="italic">
            {inner}
          </em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={'space-y-1.5 leading-relaxed ' + className}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className={'text-sm font-bold mt-2 mb-1 ' + (isUser ? 'text-white' : 'text-gray-900')}>
              {renderInline(trimmed.slice(4))}
            </h4>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className={'text-base font-bold mt-2.5 mb-1 ' + (isUser ? 'text-white' : 'text-gray-900')}>
              {renderInline(trimmed.slice(3))}
            </h3>
          );
        }

        if (/^[-*]\s+/.test(trimmed)) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className={'inline-block w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ' + (isUser ? 'bg-white/80' : 'bg-teal-500')} />
              <span className="flex-1">{renderInline(trimmed.replace(/^[-*]\s+/, ''))}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-2">
              <span className={'font-semibold flex-shrink-0 ' + (isUser ? 'text-white' : 'text-teal-700')}>{numMatch[1]}.</span>
              <span className="flex-1">{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={idx}>{renderInline(line)}</p>;
      })}
    </div>
  );
};

export default FormattedMarkdown;
