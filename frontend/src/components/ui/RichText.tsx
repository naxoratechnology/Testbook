import type { CSSProperties } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Bold, ClassicEditor, Essentials, Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, ImageUpload,
  Italic, List, Paragraph, PasteFromOffice, Subscript, Superscript, Underline,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { contentImagesApiService } from '../../services/content-images/contentImages.api';

export const questionTextClass = 'question-rich-text text-base font-semibold leading-7 text-ink sm:text-lg';
export const optionTextClass = 'text-base font-medium leading-7 sm:text-lg';
export const optionLabelClass = 'w-7 shrink-0 text-center text-base font-medium leading-7 sm:text-lg';
export const optionContentClass = 'option-rich-text min-w-0 flex-1 text-base font-medium leading-7 sm:text-lg';
export const explanationTextClass = 'text-base font-normal leading-7 sm:text-lg';

const allowedTags = new Set([
  'B', 'STRONG', 'I', 'EM', 'U', 'SUP', 'SUB', 'P', 'DIV', 'BR', 'UL', 'OL', 'LI',
  'H2', 'H3', 'H4', 'BLOCKQUOTE', 'FIGURE', 'FIGCAPTION', 'IMG', 'A',
  'MATH', 'MROW', 'MI', 'MN', 'MO', 'MSUP', 'MSUB', 'MSUBSUP', 'MFRAC', 'MSQRT', 'MROOT', 'MTEXT',
]);

export function sanitizeRichText(value: string) {
  if (!value || typeof document === 'undefined') return value || '';
  const containsRichMarkup = /<\/?(?:b|strong|i|em|u|sup|sub|p|div|br|ul|ol|li|figure|img|math)(?:\s|>|\/)/i.test(value);
  const source = containsRichMarkup ? value : value.replace(/\r\n?/g, '\n').replace(/\n/g, '<br>');
  const parsed = new DOMParser().parseFromString(`<div>${source}</div>`, 'text/html');
  const root = parsed.body.firstElementChild;
  if (!root) return '';

  const clean = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.COMMENT_NODE) { child.remove(); return; }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const element = child as HTMLElement;
      clean(element);
      if (!allowedTags.has(element.tagName.toUpperCase())) { element.replaceWith(...element.childNodes); return; }
      [...element.attributes].forEach((attribute) => {
        const tag = element.tagName.toUpperCase(); const name = attribute.name.toLowerCase(); const attributeValue = attribute.value;
        const safeImage = tag === 'IMG' && ['src', 'alt', 'width', 'height'].includes(name) && (name !== 'src' || /^https:\/\//i.test(attributeValue));
        const safeLink = tag === 'A' && name === 'href' && /^(https:\/\/|mailto:|tel:)/i.test(attributeValue);
        const safeFigureClass = tag === 'FIGURE' && name === 'class' && /^image(?:\s|$)/.test(attributeValue);
        const safeFigureStyle = tag === 'FIGURE' && name === 'style' && /^width:\s*\d+(?:\.\d+)?%?;?$/i.test(attributeValue);
        if (!safeImage && !safeLink && !safeFigureClass && !safeFigureStyle) element.removeAttribute(attribute.name);
      });
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

export function hasRichTextContent(value: string) {
  return Boolean(richTextToPlain(value) || /<img\b/i.test(value));
}

export function RichText({ value, className = '' }: { value: string; className?: string }) {
  return <div className={`rich-text whitespace-pre-wrap ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }} />;
}

type UploadLoader = { file: Promise<File>; uploadTotal?: number; uploaded?: number };

class QuestionImageUploadAdapter {
  constructor(private loader: UploadLoader) {}
  async upload() {
    const file = await this.loader.file;
    const response = await contentImagesApiService.upload(file, (percent) => { this.loader.uploadTotal = 100; this.loader.uploaded = percent; });
    return { default: response.data.data.url as string };
  }
  abort() {}
}

function QuestionImageUploadPlugin(editor: ClassicEditor) {
  const repository = editor.plugins.get('FileRepository') as unknown as { createUploadAdapter: (loader: UploadLoader) => QuestionImageUploadAdapter };
  repository.createUploadAdapter = (loader) => new QuestionImageUploadAdapter(loader);
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = '110px', ariaLabel }: { value: string; onChange: (value: string) => void; placeholder?: string; minHeight?: string; ariaLabel?: string }) {
  return <div className="ckeditor-field min-w-0 max-w-full" style={{ '--ckeditor-min-height': minHeight } as CSSProperties} aria-label={ariaLabel}>
    <CKEditor
      editor={ClassicEditor}
      data={value || ''}
      config={{
        licenseKey: 'GPL',
        plugins: [Essentials, Paragraph, Bold, Italic, Underline, Superscript, Subscript, List, PasteFromOffice, Image, ImageCaption, ImageStyle, ImageResize, ImageToolbar, ImageUpload],
        toolbar: ['undo', 'redo', '|', 'bold', 'italic', 'underline', 'superscript', 'subscript', '|', 'bulletedList', 'numberedList', '|', 'uploadImage'],
        image: { toolbar: ['imageTextAlternative', 'toggleImageCaption', '|', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'resizeImage'] },
        placeholder,
        extraPlugins: [QuestionImageUploadPlugin],
      }}
      onChange={(_event, editor) => {
        const data = editor.getData();
        onChange(hasRichTextContent(data) ? data : '');
      }}
    />
  </div>;
}
