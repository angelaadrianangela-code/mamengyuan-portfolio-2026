"use client";

import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy, type RenderTask } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerSrc;

type PdfViewerProps = {
  src: string;
  title: string;
};

type PdfStatus = "loading" | "ready" | "error";

export function PdfViewer({ src, title }: PdfViewerProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);
  const renderedPagesRef = useRef(new Map<number, string>());
  const renderTasksRef = useRef(new Map<number, RenderTask>());
  const visiblePagesRef = useRef(new Set<number>([1]));
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [status, setStatus] = useState<PdfStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setPageCount(0);
    setCurrentPage(1);
    setRotation(0);
    renderedPagesRef.current.clear();
    visiblePagesRef.current = new Set([1]);

    const loadingTask = getDocument({
      url: src,
      useWorkerFetch: true,
      isEvalSupported: true,
      disableStream: false,
      disableAutoFetch: false,
    });

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
      for (const task of renderTasksRef.current.values()) task.cancel();
      renderTasksRef.current.clear();
      void loadingTask.destroy();
      void documentRef.current?.destroy();
      documentRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    if (status !== "ready" || !pageCount || !bodyRef.current || !documentRef.current) return;

    const body = bodyRef.current;
    let cancelled = false;
    let renderVersion = 0;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const renderPage = async (pageNumber: number) => {
      const pdf = documentRef.current;
      if (!pdf || cancelled || pageNumber < 1 || pageNumber > pdf.numPages) return;
      const canvas = body.querySelector<HTMLCanvasElement>(`canvas[data-page="${pageNumber}"]`);
      if (!canvas) return;

      const width = Math.max(body.clientWidth - 24, 260);
      const cacheKey = `${Math.round(width)}:${rotation}`;
      if (renderedPagesRef.current.get(pageNumber) === cacheKey) return;

      renderTasksRef.current.get(pageNumber)?.cancel();
      const page = await pdf.getPage(pageNumber);
      if (cancelled) return;
      const baseViewport = page.getViewport({ scale: 1, rotation });
      const scale = width / baseViewport.width;
      const viewport = page.getViewport({ scale, rotation });
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) return;

      canvas.width = Math.ceil(viewport.width * pixelRatio);
      canvas.height = Math.ceil(viewport.height * pixelRatio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, viewport.width, viewport.height);

      const version = renderVersion;
      const task = page.render({ canvasContext: context, viewport });
      renderTasksRef.current.set(pageNumber, task);
      try {
        await task.promise;
        if (!cancelled && version === renderVersion) renderedPagesRef.current.set(pageNumber, cacheKey);
      } catch {
        // Canceled renders are expected when a user rotates or resizes the viewer.
      } finally {
        renderTasksRef.current.delete(pageNumber);
        page.cleanup();
      }
    };

    const renderVisiblePages = () => {
      for (const pageNumber of visiblePagesRef.current) void renderPage(pageNumber);
    };

    const pageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const pageNumber = Number((entry.target as HTMLCanvasElement).dataset.page);
          if (pageNumber) {
            visiblePagesRef.current.add(pageNumber);
            void renderPage(pageNumber);
          }
        });
      },
      { root: body, rootMargin: "640px 0px", threshold: 0.01 },
    );

    body.querySelectorAll<HTMLCanvasElement>("canvas[data-page]").forEach((canvas) => pageObserver.observe(canvas));
    renderVisiblePages();

    const resizeObserver = new ResizeObserver(() => {
      renderVersion += 1;
      renderedPagesRef.current.clear();
      renderVisiblePages();
    });
    resizeObserver.observe(body);

    return () => {
      cancelled = true;
      renderVersion += 1;
      for (const task of renderTasksRef.current.values()) task.cancel();
      renderTasksRef.current.clear();
      pageObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [pageCount, rotation, status]);

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), pageCount);
    setCurrentPage(nextPage);
    visiblePagesRef.current.add(nextPage);
    bodyRef.current?.querySelector<HTMLCanvasElement>(`canvas[data-page="${nextPage}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  };

  return (
    <div className="pdfViewer" ref={bodyRef} aria-label={`${title} PDF 内容`}>
      <div className="pdfViewerToolbar" aria-label="PDF 阅读控制">
        <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>上一页</button>
        <span aria-live="polite">{pageCount ? `${currentPage} / ${pageCount}` : "加载中"}</span>
        <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={!pageCount || currentPage >= pageCount}>下一页</button>
        <button type="button" onClick={() => setRotation((value) => (value + 90) % 360)} disabled={status !== "ready"}>旋转</button>
      </div>
      {status === "loading" && <p className="pdfViewerStatus">正在加载项目内容…</p>}
      {status === "error" && <p className="pdfViewerStatus">项目内容加载失败，请稍后重试。</p>}
      {status === "ready" && Array.from({ length: pageCount }, (_, index) => (
        <canvas key={index + 1} data-page={index + 1} aria-label={`${title} 第 ${index + 1} 页`} />
      ))}
    </div>
  );
}
