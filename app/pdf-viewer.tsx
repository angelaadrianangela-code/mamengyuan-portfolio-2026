"use client";

import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerSrc;

type PdfViewerProps = {
  src: string;
  title: string;
};

export function PdfViewer({ src, title }: PdfViewerProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    const loadingTask = getDocument({ url: src, useWorkerFetch: true, isEvalSupported: true });

    loadingTask.promise.then((pdf) => {
      if (cancelled) {
        void pdf.destroy();
        return;
      }
      documentRef.current = pdf;
      setPageCount(pdf.numPages);
      setStatus("ready");
    }).catch(() => {
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
      void loadingTask.destroy();
      documentRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    if (status !== "ready" || !pageCount || !bodyRef.current || !documentRef.current) return;

    const body = bodyRef.current;
    let cancelled = false;
    let renderVersion = 0;

    const renderPages = async () => {
      const pdf = documentRef.current;
      if (!pdf) return;
      const version = ++renderVersion;
      const width = Math.max(body.clientWidth - 24, 280);

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        if (cancelled || version !== renderVersion) return;

        const canvas = body.querySelector<HTMLCanvasElement>(`canvas[data-page="${pageNumber}"]`);
        if (!canvas) continue;
        const baseViewport = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: width / baseViewport.width });
        const context = canvas.getContext("2d");
        if (!context) continue;
        canvas.width = Math.ceil(viewport.width * window.devicePixelRatio);
        canvas.height = Math.ceil(viewport.height * window.devicePixelRatio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
        await page.render({ canvasContext: context, viewport }).promise;
      }
    };

    const resizeObserver = new ResizeObserver(() => void renderPages());
    resizeObserver.observe(body);
    void renderPages();

    return () => {
      cancelled = true;
      renderVersion += 1;
      resizeObserver.disconnect();
    };
  }, [pageCount, status]);

  return (
    <div className="pdfViewer" ref={bodyRef} aria-label={`${title} PDF 内容`}>
      {status === "loading" && <p className="pdfViewerStatus">正在加载项目内容…</p>}
      {status === "error" && <p className="pdfViewerStatus">项目内容加载失败，请稍后重试。</p>}
      {status === "ready" && Array.from({ length: pageCount }, (_, index) => (
        <canvas key={index + 1} data-page={index + 1} aria-label={`${title} 第 ${index + 1} 页`} />
      ))}
    </div>
  );
}
