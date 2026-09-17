export function resizeCanvas(cv: HTMLCanvasElement, logicalW: number, logicalH: number): void {
  const dpr = window.devicePixelRatio || 1;
  cv.style.width = logicalW + "px";
  cv.style.height = logicalH + "px";
  cv.width = Math.floor(logicalW * dpr);
  cv.height = Math.floor(logicalH * dpr);
  const ctx = cv.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
