import { ELEMENT_COLORS, Element, SandWorld } from "./sim/world";

export function mountApp(root: HTMLElement): void {
  root.innerHTML = `
    <div style="padding:16px;display:flex;flex-direction:column;align-items:center;gap:10px;">
      <h1 style="margin:0;font-size:18px;">Falling Sand Elements</h1>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <select id="el-select">
          <option value="${Element.Sand}">Sand</option>
          <option value="${Element.Water}">Water</option>
          <option value="${Element.Stone}">Stone</option>
          <option value="${Element.Wood}">Wood</option>
          <option value="${Element.Fire}">Fire</option>
          <option value="${Element.Acid}">Acid</option>
          <option value="${Element.Lava}">Lava</option>
        </select>
        <label style="font-size:12px;">Brush <input id="brush" type="range" min="1" max="8" value="3"></label>
        <button id="pause-btn" type="button">Pause</button>
        <button id="clear-btn" type="button">Clear</button>
      </div>
      <canvas id="sand-canvas" width="160" height="120" style="width:480px;height:360px;image-rendering:pixelated;border:1px solid #27272a;border-radius:8px;cursor:crosshair;"></canvas>
    </div>
  `;

  const canvas = root.querySelector<HTMLCanvasElement>("#sand-canvas")!;
  const ctx = canvas.getContext("2d")!;
  const world = new SandWorld(160, 120);
  const img = ctx.createImageData(160, 120);
  const elSelect = root.querySelector<HTMLSelectElement>("#el-select")!;
  const brushInput = root.querySelector<HTMLInputElement>("#brush")!;
  let paused = false;
  let drawing = false;

  const paintAt = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * 160);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * 120);
    world.paint(x, y, Number(brushInput.value), Number(elSelect.value) as Element);
  };

  canvas.addEventListener("pointerdown", (e) => { drawing = true; paintAt(e); });
  window.addEventListener("pointerup", () => { drawing = false; });
  canvas.addEventListener("pointermove", (e) => { if (drawing) paintAt(e); });

  root.querySelector<HTMLButtonElement>("#pause-btn")!.addEventListener("click", (e) => {
    paused = !paused;
    (e.target as HTMLButtonElement).textContent = paused ? "Resume" : "Pause";
  });
  root.querySelector<HTMLButtonElement>("#clear-btn")!.addEventListener("click", () => world.clear());

  const loop = () => {
    if (!paused) world.step();
    for (let i = 0; i < world.grid.length; i++) {
      const [r, g, b] = ELEMENT_COLORS[world.grid[i]] ?? [0, 0, 0];
      img.data[i * 4] = r;
      img.data[i * 4 + 1] = g;
      img.data[i * 4 + 2] = b;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
