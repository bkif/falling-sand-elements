export const enum Element {
  Empty = 0,
  Sand = 1,
  Water = 2,
  Stone = 3,
  Wood = 4,
  Fire = 5,
  Smoke = 6,
  Acid = 7,
  Lava = 8,
}

export const ELEMENT_COLORS: Record<number, [number, number, number]> = {
  [Element.Empty]: [9, 9, 11],
  [Element.Sand]: [234, 179, 8],
  [Element.Water]: [56, 189, 248],
  [Element.Stone]: [113, 113, 122],
  [Element.Wood]: [120, 53, 15],
  [Element.Fire]: [249, 115, 22],
  [Element.Smoke]: [161, 161, 170],
  [Element.Acid]: [74, 222, 128],
  [Element.Lava]: [239, 68, 68],
};

export class SandWorld {
  readonly width: number;
  readonly height: number;
  readonly grid: Uint8Array;

  constructor(width = 160, height = 120) {
    this.width = width;
    this.height = height;
    this.grid = new Uint8Array(width * height);
  }

  clear(): void {
    this.grid.fill(Element.Empty);
  }

  paint(cx: number, cy: number, radius: number, el: Element): void {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          this.grid[y * this.width + x] = el;
        }
      }
    }
  }

  step(): void {
    const w = this.width;
    const h = this.height;
    for (let y = h - 2; y >= 0; y--) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const el = this.grid[i];
        if (el === Element.Empty || el === Element.Stone || el === Element.Wood) continue;

        const below = (y + 1) * w + x;
        if (el === Element.Sand) {
          if (this.grid[below] === Element.Empty || this.grid[below] === Element.Water) {
            const tmp = this.grid[below];
            this.grid[below] = Element.Sand;
            this.grid[i] = tmp;
          } else {
            const dir = Math.random() < 0.5 ? -1 : 1;
            const nx = x + dir;
            if (nx >= 0 && nx < w && this.grid[(y + 1) * w + nx] === Element.Empty) {
              this.grid[(y + 1) * w + nx] = Element.Sand;
              this.grid[i] = Element.Empty;
            }
          }
        } else if (el === Element.Water || el === Element.Acid || el === Element.Lava) {
          if (this.grid[below] === Element.Empty) {
            this.grid[below] = el;
            this.grid[i] = Element.Empty;
          } else {
            const dir = Math.random() < 0.5 ? -1 : 1;
            const nx = x + dir;
            if (nx >= 0 && nx < w && this.grid[y * w + nx] === Element.Empty) {
              this.grid[y * w + nx] = el;
              this.grid[i] = Element.Empty;
            }
          }
        } else if (el === Element.Fire || el === Element.Smoke) {
          if (Math.random() < 0.08) {
            this.grid[i] = el === Element.Fire ? Element.Smoke : Element.Empty;
          } else if (y > 0 && this.grid[(y - 1) * w + x] === Element.Empty) {
            this.grid[(y - 1) * w + x] = el;
            this.grid[i] = Element.Empty;
          }
        }
      }
    }
  }
}
