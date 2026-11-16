"use client";

import { useEffect, useRef } from "react";

export function HeroOrbs() {
  const meshRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    const hero = mesh?.closest<HTMLElement>(".hero");
    if (!mesh || !hero) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const buttons = [...mesh.querySelectorAll<HTMLButtonElement>(".heroOrbButton")];
    const states = buttons.map((button) => ({ button, x: 0, y: 0, targetX: 0, targetY: 0,
      active: false, pointer: -1, startX: 0, startY: 0, originX: 0, originY: 0 }));
    const cleanups: (() => void)[] = [];
    for (const state of states) {
      const button = state.button;
      const down = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        state.pointer = event.pointerId;
        state.startX = event.clientX; state.startY = event.clientY;
        state.originX = state.x; state.originY = state.y;
        button.setPointerCapture(event.pointerId);
        button.dataset.dragging = "true";
        event.preventDefault();
      };
      const move = (event: PointerEvent) => {
        if (state.pointer !== event.pointerId) return;
        const scene = hero.getBoundingClientRect();
        state.targetX = Math.max(-scene.width * 0.65, Math.min(scene.width * 0.4, state.originX + event.clientX - state.startX));
        state.targetY = Math.max(-scene.height * 0.45, Math.min(scene.height * 0.55, state.originY + event.clientY - state.startY));
      };
      const release = () => {
        if (state.pointer >= 0 && button.hasPointerCapture(state.pointer)) button.releasePointerCapture(state.pointer);
        state.pointer = -1;
        state.targetX = 0; state.targetY = 0;
        delete button.dataset.dragging;
      };
      const enter = () => { state.active = true; };
      const leave = () => { state.active = false; };
      const key = (event: KeyboardEvent) => {
        const directions: Record<string, [number, number]> = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] };
        if (event.key === "Escape") release();
        const direction = directions[event.key];
        if (!direction) return;
        event.preventDefault();
        state.targetX = Math.max(-hero.clientWidth * 0.65, Math.min(hero.clientWidth * 0.4, state.targetX + direction[0]));
        state.targetY = Math.max(-hero.clientHeight * 0.45, Math.min(hero.clientHeight * 0.55, state.targetY + direction[1]));
      };
      const listeners = { pointerdown: down, pointermove: move, pointerup: release, pointercancel: release,
        lostpointercapture: release, pointerenter: enter, pointerleave: leave, focus: enter, blur: () => { leave(); release(); }, keydown: key };
      for (const [name, handler] of Object.entries(listeners)) {
        button.addEventListener(name, handler as EventListener);
        cleanups.push(() => button.removeEventListener(name, handler as EventListener));
      }
    }
    let frame = 0;
    let visible = false;
    let previousTime = 0;
    const tick = (time: number) => {
      const elapsed = Math.min(40, previousTime ? time - previousTime : 16);
      previousTime = time;
      const scene = hero.getBoundingClientRect();
      const ratio = 1672 / 941;
      const imageWidth = Math.min(scene.width, scene.height * ratio);
      const imageHeight = imageWidth / ratio;
      for (const state of states) {
        const easing = reduced.matches ? 1 : 1 - Math.exp(-elapsed / (state.pointer >= 0 ? 45 : 160));
        state.x += (state.targetX - state.x) * easing;
        state.y += (state.targetY - state.y) * easing;
        state.button.style.setProperty("--drag-x", `${state.x}px`);
        state.button.style.setProperty("--drag-y", `${state.y}px`);
        if (!state.active && state.pointer < 0) continue;
        const rect = state.button.getBoundingClientRect();
        const zoom = reduced.matches ? 1 : 1.035;
        const x = rect.left - scene.left + rect.width / 2;
        const y = rect.top - scene.top + rect.height / 2;
        state.button.style.setProperty("--lens-size", `${imageWidth * zoom}px ${imageHeight * zoom}px`);
        state.button.style.setProperty("--lens-position", `${rect.width / 2 - (x - (scene.width - imageWidth) / 2) * zoom}px ${rect.height / 2 - (y - (scene.height - imageHeight) / 2) * zoom}px`);
      }
      if (visible) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      previousTime = 0;
      if (visible) frame = requestAnimationFrame(tick);
    });
    observer.observe(hero);
    return () => { visible = false; cancelAnimationFrame(frame); observer.disconnect(); cleanups.forEach((cleanup) => cleanup()); };
  }, []);

  return <div className="heroMesh interactiveMesh" ref={meshRef}>
    {["大", "小"].map((size) => <div className="heroOrb" key={size}>
      <button className="heroOrbButton" type="button" aria-label={`拖动${size}圆环探索背景，可用方向键移动，Esc复位`} />
    </div>)}
    <span aria-hidden="true" />
  </div>;
}
