import { useEffect, useRef } from 'react';

export const questionTextClass = 'question-rich-text text-base font-semibold leading-7 text-ink sm:text-lg';
export const optionTextClass = 'text-base font-medium leading-7 sm:text-lg';
export const optionLabelClass = 'w-7 shrink-0 text-center text-base font-medium leading-7 sm:text-lg';
export const optionContentClass = 'option-rich-text min-w-0 flex-1 text-base font-medium leading-7 sm:text-lg';
export const explanationTextClass = 'text-base font-normal leading-7 sm:text-lg';

const allowedTags = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'SUP', 'SUB', 'P', 'DIV', 'BR', 'UL', 'OL', 'LI', 'MATH', 'MROW', 'MI', 'MN', 'MO', 'MSUP', 'MSUB', 'MSUBSUP', 'MFRAC', 'MSQRT', 'MROOT', 'MTEXT']);

export function sanitizeRichText(value: string) {
  if (!value || typeof document === 'undefined') return value || '';
  const containsRichMarkup = /<\/?(?:b|strong|i|em|u|sup|sub|p|div|br|ul|ol|li)(?:\s|>|\/)/i.test(value);
  const source = containsRichMarkup ? value : value.replace(/\r\n?/g, '\n').replace(/\n/g, '<br>');
  const parsed = new DOMParser().parseFromString(`<div>${source}</div>`, 'text/html');
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
      if (!allowedTags.has(element.tagName.toUpperCase())) element.replaceWith(...element.childNodes);
      else [...element.attributes].forEach((attribute) => element.removeAttribute(attribute.name));
    });
  };
  clean(root);

  const emptyBlock = (element: Element) => ['P', 'DIV'].includes(element.tagName)
    && !(element.textContent || '').replace(/\u200B/g, '').trim()
    && [...element.children].every((child) => child.tagName === 'BR');
  [...root.querySelectorAll('p, div')].forEach((element) => {
    if (emptyBlock(element) && element.previousElementSibling && emptyBlock(element.previousElementSibling)) element.remove();
  });
  while (root.firstElementChild && emptyBlock(root.firstElementChild)) root.firstElementChild.remove();
  while (root.lastElementChild && emptyBlock(root.lastElementChild)) root.lastElementChild.remove();
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

  const emitValue = (element: HTMLDivElement) => {
    const cleaned = sanitizeRichText(element.innerHTML);
    onChange(richTextToPlain(cleaned) ? cleaned : '');
  };

  const ensureCaret = (element: HTMLDivElement) => {
    const selection = window.getSelection();
    if (!selection || (selection.rangeCount > 0 && selection.anchorNode && element.contains(selection.anchorNode))) return;
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection.addRange(range);
  };

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

  return <div className="min-w-0 max-w-full overflow-hidden rounded-xl border border-line bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
    <div className="flex flex-wrap gap-1 border-b border-line bg-canvas/70 p-2">
      {tools.map(([command, label, title]) => <button key={command} type="button" title={title} aria-label={title} onMouseDown={(event) => { event.preventDefault(); format(command); }} className="min-w-8 rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink-soft hover:border-brand-300 hover:text-brand-700">{label}</button>)}
    </div>
    <div
      ref={editor}
      contentEditable={true}
      suppressContentEditableWarning
      tabIndex={0}
      spellCheck={true}
      role="textbox"
      aria-label={ariaLabel}
      aria-multiline="true"
      data-placeholder={placeholder}
      style={{ minHeight }}
      className="rich-editor min-w-0 max-w-full cursor-text overflow-x-hidden overflow-y-auto break-words px-3.5 py-3 text-sm leading-6 text-ink outline-none empty:before:pointer-events-none empty:before:text-ink-muted empty:before:content-[attr(data-placeholder)]"
      onFocus={(event) => ensureCaret(event.currentTarget)}
      onInput={(event) => emitValue(event.currentTarget)}
      onPaste={(event) => {
        event.preventDefault();
        const scrollLeft = window.scrollX; const scrollTop = window.scrollY;
        const clipboardText = event.clipboardData.getData('text/plain').replace(/\r\n?/g, '\n');
        const clipboardHtml = event.clipboardData.getData('text/html');
        const selection = window.getSelection();
        if (!selection) return;
        if (!selection.rangeCount || !selection.anchorNode || !event.currentTarget.contains(selection.anchorNode)) {
          selection.removeAllRanges();
          const initialRange = document.createRange();
          initialRange.selectNodeContents(event.currentTarget);
          initialRange.collapse(false);
          selection.addRange(initialRange);
        }
        const range = selection.getRangeAt(0);
        range.deleteContents();
        let fragment: DocumentFragment;
        let lastNode: Node | null = null;
        if (/<(?:math|sup|sub)(?:\s|>)/i.test(clipboardHtml)) {
          const template = document.createElement('template');
          template.innerHTML = sanitizeRichText(clipboardHtml);
          fragment = template.content;
          lastNode = fragment.lastChild;
        } else {
          fragment = document.createDocumentFragment();
          clipboardText.split('\n').forEach((line, index) => {
            if (index) { lastNode = document.createElement('br'); fragment.appendChild(lastNode); }
            if (line) { lastNode = document.createTextNode(line); fragment.appendChild(lastNode); }
          });
        }
        range.insertNode(fragment);
        if (lastNode) { range.setStartAfter(lastNode); range.collapse(true); selection.removeAllRanges(); selection.addRange(range); }
        emitValue(event.currentTarget);
        window.requestAnimationFrame(() => window.scrollTo(scrollLeft, scrollTop));
      }}
      onBlur={(event) => {
        const cleaned = sanitizeRichText(event.currentTarget.innerHTML);
        if (!richTextToPlain(cleaned)) event.currentTarget.innerHTML = '';
        onChange(richTextToPlain(cleaned) ? cleaned : '');
      }}
    />
  </div>;
}
