export const tileColors = [
  {
    match: /BUSH/,
    color: "rgb(27, 92, 52)"
  },
  {
    match: /GRASS/,
    color: "rgb(43, 143, 81)"
  },
  {
    match: /RIVER|WATER(?!FALL)/,
    color: "rgb(65, 87, 165)"
  },
  {
    match: /SAND/,
    color: "rgb(209, 191, 151)"
  },
  {
    match: /SEA/,
    color: "rgb(45, 65, 136)"
  },
  {
    match: /SOIL|_(63)/,
    color: "rgb(189, 182, 96)"
  },
  {
    match: /STONE|_(3[2-5])/,
    color: "rgb(126, 166, 182)"
  },
  {
    match: /WATERFALL/,
    color: "rgb(106, 159, 228)"
  },
  {
    match: /WOOD|_(2[7-9]|3[01])/,
    color: "rgb(156, 82, 82)"
  },
  {
    match: /_(2[56]|3[6-8])/, // WAVES
    color: "rgb(83, 107, 196)"
  },
  {
    match: /_(39|4[0-9]|5[0-9]|6[0-2])/, // RIVER BANKS & CLIFFS
    color: "rgb(94, 66, 84)"
  }
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
  backgroundTiles = new Array(256);

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
  foregroundTiles = new Array(256);

  constructor(name, edge, backgroundType) {
    this.name = name;
    this.edge = edge;
    this.backgroundType = backgroundType;
  }

  svg() {
    const div = document.createElement("div");

    div.className = "acre";
    div.setAttribute("data-location", this.name);
    div.setAttribute("data-background", this.backgroundType.name);

    if (this.edge != "") {
      div.setAttribute("data-edge", this.edge);
    }

    let svg = "<svg viewBox=\"0 0 16 16\" width=\"100%\" height=\"100%\">";

    for (let i = 0; i < this.backgroundType.backgroundTiles.length; i++) {
      const x = i % 16;
      const y = Math.floor(i / 16);
      const fill = this.backgroundType.backgroundTiles[i].color;

      svg += "<rect x=\"" + x + "\" y=\"" + y + "\" width=\"1.05\" height=\"1.05\" fill=\"" + fill + "\"/>";    
    }

    svg += "</svg>";
    div.innerHTML = svg;

    return div;
  }
}

export class Town {
  name = "ANIMALCROSSING";
  acres = new Array(30);
}
