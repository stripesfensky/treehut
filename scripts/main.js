import * as common from "./common.js";
import * as field from "./field.js";
import * as save from "./save.js";

let fieldInfo = await getFieldInfo();
let gci = document.getElementById("gci");
let map = document.getElementById("map");
let upload = document.getElementById("upload");
let acres;

if (fieldInfo != null) {
  upload.reset();
  gci.style.display = "block";
}
else {
  common.setMessage("<b>ERROR:</b> There was an error loading the source data; please try again another time.", "red");
}

gci.addEventListener("change", async (gciUpload) => {
  map.innerHTML = "";
  common.setMessage("", "");
  acres = await save.loadSave(fieldInfo, gciUpload);
  
  if (acres != null) {
    let townGrid = document.createElement("div");

    for (let i = 0; i < acres.length; i++){
      townGrid.append(acres[i].canvas());
    }

    townGrid.id = "towngrid";
    map.innerHTML = "<hr /><h2>Town Map</h2>";
    map.appendChild(townGrid);
  }
});

async function getSource(url, regex) {
  const response = await fetch(url);

  if (response.status != 200) {
    console.error("Could not import \"" + url + "\" (status code: " + response.status + ")");
  } 
  else {
    console.info("Successfully imported \"" + url + "\"");
    const match = (await response.text()).match(regex);
    return match;
  }
}

async function getFieldInfo() {
  const backgroundTypes = [];
  const backgroundTiles = [];

  const bgData = await getSource("./source/bg_data.c", /extern\smFM_bg_data_c\sdata_bgd\[]\s=\s{[\s\S]+?\n};/);
  const tileData = await getSource("./source/m_collision_bg.h", /enum\s*background_attribute\s*{\s*([\s\S]*?)\s*\};/);
  const combiData = await getSource("./source/data_combi.c", /data_combi_table\s*\[\s*\]\s*=\s*\{\s*([\s\S]*?)\s*\};/);

  if (bgData == null || tileData == null || combiData == null) {
    return;
  }

  const bgMatches = [...bgData[0].matchAll(/{\s*(BG_TYPE_\w+)[\s\S]*?\/\/ collision data\s*{([\s\S]*?)}\s*,\s*\/\/\s*sound/g)];
  const tileMatches = tileData[0].match(/mCoBG_ATTRIBUTE\w+/g);

  for (const match of tileMatches) {
    const type = match;
    backgroundTiles.push(new field.BackgroundTile(type));
  }

  const backgroundTileMap = new Map(backgroundTiles.map(tile => [tile.type, tile]));

  const combiMatches = combiData[0].match(/BG_TYPE_\w+/g);

  for (const match of bgMatches) {
    const name = match[1];
    const matchTiles = match[2].match(/mCoBG_ATTRIBUTE_\w+/g).map(collision => backgroundTileMap.get(collision));

    let indices = [];
    
    for (let i = 0; i < combiMatches.length; i++) {
      if (name == combiMatches[i]) {
        indices.push(i);
      }
    }

    backgroundTypes.push(new field.BackgroundType(name, indices, matchTiles));
  }

  return backgroundTypes;
}
