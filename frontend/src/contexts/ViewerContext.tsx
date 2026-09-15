import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AttemptResult } from '../types';

export type PdfModule = 'syllabus' | 'notes' | 'course' | 'current-affairs' | 'previous-paper';

export interface PdfDoc {
  title: string;
  subtitle: string;
  module: PdfModule;
  url?: string;
  pages: {heading: string;body: string[];}[];
}

interface ViewerValue {
  pdf: PdfDoc | null;
  openPdf: (doc: PdfDoc) => void;
  closePdf: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  lastResult: AttemptResult | null;
  saveResult: (result: AttemptResult) => void;
}

const ViewerContext = createContext<ViewerValue | null>(null);

export function ViewerProvider({ children }: {children: React.ReactNode;}) {
  const [pdf, setPdf] = useState<PdfDoc | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lastResult, setLastResult] = useState<AttemptResult | null>(null);

  const openPdf = useCallback((doc: PdfDoc) => setPdf(doc), []);
  const closePdf = useCallback(() => setPdf(null), []);
  const saveResult = useCallback((result: AttemptResult) => setLastResult(result), []);

  const value = useMemo(
    () => ({ pdf, openPdf, closePdf, searchOpen, setSearchOpen, lastResult, saveResult }),
    [pdf, openPdf, closePdf, searchOpen, lastResult, saveResult]
  );

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export function useViewer() {
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error('useViewer must be used inside ViewerProvider');
  return ctx;
}

export function buildPdf(
title: string,
subtitle: string,
module: PdfModule,
topics: string[])
: PdfDoc {
  return {
    title,
    subtitle,
    module,
    pages: topics.map((topic, i) => ({
      heading: `${i + 1}. ${topic}`,
      body: [
      `This section covers ${topic.toLowerCase()} in the exact sequence followed in the official pattern, beginning with the core definitions and moving into applied problems.`,
      'Key points are summarised first, followed by worked examples with step-by-step reasoning so the method can be reproduced under exam pressure.',
      'Practice questions at the end of the section are arranged from easy to difficult, with answer keys and short explanations for every item.',
      'Revision tip: attempt the last five questions of this section again after two days to lock the method into long-term memory.']

    }))
  };
}
