import { useEffect, useRef } from 'react';

export const questionTextClass = 'text-base font-semibold leading-7 text-ink sm:text-lg';
export const optionTextClass = 'text-base font-medium leading-7 sm:text-lg';
export const explanationTextClass = 'text-base font-normal leading-7 sm:text-lg';

const allowedTags = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'SUP', 'SUB', 'P', 'DIV', 'BR', 'UL', 'OL', 'LI']);

export function sanitizeRichText(value: string) {
  if (!value || typeof document === 'undefined') return value || '';
  const parsed = new DOMParser().parseFromString(`<div>${value}</div>`, 'text/html');
  const root = parsed.body.firstElementChild;
  if (!root) return '';

  const clean = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const element = child as HTMLElement;
      clean(element);
      if (!allowedTags.has(element.tagName)) element.replaceWith(...element.childNodes);
      else [...element.attributes].forEach((attribute) => element.removeAttribute(attribute.name));
    });
  };
  clean(root);
  return root.innerHTML;
}

export function richTextToPlain(value: string) {
  if (!value || typeof document === 'undefined') return value || '';
  const parsed = new DOMParser().parseFromString(value, 'text/html');
  return (parsed.body.textContent || '').replace(/\u00a0/g, ' ').trim();
}

export function RichText({ value, className = '' }: { value: string; className?: string }) {
  return <div className={`rich-text whitespace-pre-wrap ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }} />;
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = '110px', ariaLabel }: { value: string; onChange: (value: string) => void; placeholder?: string; minHeight?: string; ariaLabel?: string }) {
  const editor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editor.current && document.activeElement !== editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = sanitizeRichText(value);
  }, [value]);

  const format = (command: string) => {
    editor.current?.focus();
    document.execCommand(command);
    if (editor.current) onChange(sanitizeRichText(editor.current.innerHTML));
  };

  const tools = [
    ['bold', 'B', 'Bold'],
    ['italic', 'I', 'Italic'],
    ['underline', 'U', 'Underline'],
    ['superscript', 'x²', 'Superscript'],
    ['subscript', 'x₂', 'Subscript'],
    ['insertUnorderedList', '• List', 'Bullet list'],
    ['insertOrderedList', '1. List', 'Numbered list'],
  ];

  return <div className="overflow-hidden rounded-xl border border-line bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
    <div className="flex flex-wrap gap-1 border-b border-line bg-canvas/70 p-2">
      {tools.map(([command, label, title]) => <button key={command} type="button" title={title} aria-label={title} onMouseDown={(event) => { event.preventDefault(); format(command); }} className="min-w-8 rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink-soft hover:border-brand-300 hover:text-brand-700">{label}</button>)}
    </div>
    <div
      ref={editor}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={ariaLabel}
      aria-multiline="true"
      data-placeholder={placeholder}
      style={{ minHeight }}
      className="rich-editor overflow-y-auto px-3.5 py-3 text-sm leading-6 text-ink outline-none empty:before:pointer-events-none empty:before:text-ink-muted empty:before:content-[attr(data-placeholder)]"
      onInput={(event) => onChange(sanitizeRichText(event.currentTarget.innerHTML))}
      onBlur={(event) => {
        const cleaned = sanitizeRichText(event.currentTarget.innerHTML);
        if (!richTextToPlain(cleaned)) event.currentTarget.innerHTML = '';
        onChange(richTextToPlain(cleaned) ? cleaned : '');
      }}
    />
  </div>;
}
