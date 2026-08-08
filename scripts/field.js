export const tileColors = [
  { match: /BUSH/, color: "rgb(27, 92, 52)" },
  { match: /GRASS/, color: "rgb(43, 143, 81)" },
  { match: /WATERFALL/, color: "rgb(106, 159, 228)" },
  { match: /RIVER|WATER(?!FALL)/, color: "rgb(65, 87, 165)" },
  { match: /SAND/, color: "rgb(209, 191, 151)" },
  { match: /SEA/, color: "rgb(45, 65, 136)" },
  { match: /SOIL|_(63)/, color: "rgb(189, 182, 96)" },
  { match: /STONE|_(3[2-5])/, color: "rgb(126, 166, 182)" },
  { match: /WOOD|_(2[7-9]|3[01])/, color: "rgb(156, 82, 82)" },
  { match: /_(2[56]|3[6-8])/, color: "rgb(83, 107, 196)" }, // WAVES 
  { match: /_(39|4[0-9]|5[0-9]|6[0-2])/, color: "rgb(94, 66, 84)" } // RIVER BANKS & CLIFFS
];

export function getTileColor(backgroundTileType) {
  for (const tc of tileColors) {
    if (tc.match.test(backgroundTileType)) {
      return tc.color;
    }
  }
  return "rgb(255, 255, 255)";
}

export class BackgroundTile {
  type = "BGTILETYPE";
  color = "rgb(255, 255, 255)";

  constructor(type) {
    this.type = type;
    this.color = getTileColor(type);
  }
}

export class BackgroundType {
  name = "BGTYPE";
  indices = [];
  backgroundTiles = [];

  constructor(name, indices, backgroundTiles) {
    this.name = name;
    this.indices = indices;
    this.backgroundTiles = backgroundTiles;
  }
}

export class Acre {
  name = "ACRE";
  edge = "";
  backgroundType = new BackgroundType();
  foregroundTiles = [];

  constructor(name, edge, backgroundType, foregroundTiles) {
    this.name = name;
    this.edge = edge;
    this.backgroundType = backgroundType;
    this.foregroundTiles = foregroundTiles;
  }

  canvas() {
    const div = document.createElement("div");

    div.className = "acre";
    div.setAttribute("id", this.name);

    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;

    const canvasCtx = canvas.getContext("2d");

    for (let i = 0; i < this.backgroundType.backgroundTiles.length; i++) {
      const x = i % 16;
      const y = Math.floor(i / 16);

      canvasCtx.fillStyle = this.backgroundType.backgroundTiles[i].color;
      canvasCtx.fillRect(x, y, 1, 1);
    }

    div.style.backgroundImage = `url("${canvas.toDataURL("image/png")}")`;

    return div;
  }
}
