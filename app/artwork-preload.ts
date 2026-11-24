// Warm the exact full-quality URLs used by the reader, so the HTTP/image cache is shared.
const images = new Map<string, { image: HTMLImageElement; done: Promise<void> }>();
let backgroundWork: Promise<void>[] = [];

export function preloadArtworkImage(src: string, priority: "high" | "low" = "low") {
  const existing = images.get(src);
  if (existing) {
    if (priority === "high") existing.image.fetchPriority = "high";
    return existing.done;
  }
  const image = new Image();
  image.decoding = "async";
  image.fetchPriority = priority;
  const done = new Promise<void>((resolve) => {
    image.onload = () => resolve();
    image.onerror = () => { images.delete(src); resolve(); };
  });
  images.set(src, { image, done });
  image.src = src;
  return done;
}

export async function preloadArtworkInBackground(src: string) {
  // Two background downloads at most; navigation and explicit opens take precedence.
  while (backgroundWork.length >= 2) await Promise.race(backgroundWork);
  const work = preloadArtworkImage(src);
  backgroundWork.push(work);
  await work;
  backgroundWork = backgroundWork.filter((item) => item !== work);
}
