import * as fieldUtils from "./fieldUtils.js";
import * as importUtils from "./importUtils.js";

export async function getFieldInfo() {
  const backgroundTypes = new Array();
  const backgroundTiles = new Array();

  const bg = await importUtils.returnSource("./source/bg_data.c");
  const bgMatched = bg.match(/extern\smFM_bg_data_c\sdata_bgd\[]\s=\s{[\s\S]+?\n};/);

  if (bgMatched == null) {
    return;
  }

  const tile = await importUtils.returnSource("./source/m_collision_bg.h");
  const tileMatched = tile.match(/enum\s*background_attribute\s*{\s*([\s\S]*?)\s*\};/);

  if (tileMatched == null) {
    return;
  }

  const combi = await importUtils.returnSource("./source/data_combi.c");
  const combiMatched = combi.match(/data_combi_table\s*\[\s*\]\s*=\s*\{\s*([\s\S]*?)\s*\};/);

  if (combiMatched == null) {
    return;
  }

  const bgMatches = [...bgMatched[0].matchAll(/{\s*(BG_TYPE_\w+)[\s\S]*?\/\/ collision data\s*{([\s\S]*?)}\s*,\s*\/\/\s*sound/g)];
  const tileMatches = tileMatched[0].match(/mCoBG_ATTRIBUTE\w+/g);

  for (const match of tileMatches) {
    const type = match;
    backgroundTiles.push(new fieldUtils.BackgroundTile(type));
  }

  const backgroundTileMap = new Map(backgroundTiles.map(tile => [tile.type, tile]));

  const combiMatches = combiMatched[0].match(/BG_TYPE_\w+/g);

  for (const match of bgMatches) {
    const name = match[1];
    const index = combiMatches.indexOf(name);
    const matchTiles = match[2].match(/mCoBG_ATTRIBUTE_\w+/g).map(collision => backgroundTileMap.get(collision));
    backgroundTypes.push(new fieldUtils.BackgroundType(name, index, matchTiles));
  }

  return [backgroundTypes];
}
