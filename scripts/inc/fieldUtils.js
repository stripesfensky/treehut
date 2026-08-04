export const tileColors = [
  {
    match: /BUSH/,
    color: "rgb(47, 106, 59)"
  },
  {
    match: /GRASS/,
    color: "rgb(39, 160, 93)"
  },
  {
    match: /RIVER|WATER(?!FALL)/,
    color: "rgb(60, 87, 189)"
  },
  {
    match: /SAND/,
    color: "rgb(209, 191, 151)"
  },
  {
    match: /SEA/,
    color: "rgb(35, 64, 173)"
  },
  {
    match: /SOIL|_(63)/,
    color: "rgb(202, 195, 103)"
  },
  {
    match: /STONE|_(3[2-5])/,
    color: "rgb(141, 186, 204)"
  },
  {
    match: /WATERFALL/,
    color: "rgb(129, 178, 244)"
  },
  {
    match: /WOOD|_(2[7-9]|3[01])/,
    color: "rgb(172, 121, 102)"
  },
  {
    match: /_(2[56]|3[6-8])/, // WAVES
    color: "rgb(77, 122, 208)"
  },
  {
    match: /_(39|4[0-9]|5[0-9]|6[0-2])/, // RIVER BANKS & CLIFFS
    color: "rgb(107, 75, 95)"
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
  index = -1;
  backgroundTiles = new Array(256);

  constructor(name, index, backgroundTiles) {
    this.name = name;
    this.index = index;
    this.backgroundTiles = backgroundTiles;
  }
}

export class Acre {
  row = "Z";
  column = 0;
  name = "ACRE";
  backgroundType = new BackgroundType();
  foregroundTiles = new Array(256);
}

export class Town {
  name = "ANIMALCROSSING";
  acres = new Array(30);
}
