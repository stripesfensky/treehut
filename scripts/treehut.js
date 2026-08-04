import * as hexTools from "./inc/hextools.js"

const bgdataURL = "./decomp/bg_data.c";
const combiURL = "./decomp/data_combi.c";

const asyncWait = document.getElementById("asyncwait");
const asyncFail = document.getElementById("asyncfail");
const asyncTrace = document.getElementById("asynctrace");
const uploadForm = document.getElementById("upload");
const gci = document.getElementById("gci");
const msg = document.getElementById("msg");
const map = document.getElementById("map");

let bgdata;
let combi;
let uploads;
let uploadedFile;
let townData;
let islandData;

async function getDecompSource(url) {
  console.log("Loading from URL \"" + url + "\"");
  const response = await fetch(url);

  if (response.ok == false) {
    let error = "Tried to fetch from URL \"" + url + "\" but response returned with status " + response.status;
    
    if (response.statusText.length > 0) {
      error += " (" + response.statusText + ").";
    }
    else {
      error += ".";
    }

    throw new Error(error);
  }
  
  const result = await response.text();
  console.log("Loading was successful for URL \"" + url + "\"");

  return result;
}

async function treehut() {
  try {
    const decomp = await Promise.allSettled([getDecompSource(bgdataURL), getDecompSource(combiURL)]);
    const decompFailures = decomp.filter(r => r.status == "rejected");

    if (decompFailures.length > 0) {
      const errors = decompFailures.map(f => f.reason.message).join("<br /><br />");
      throw new Error(errors);
    }

    bgdata = decomp[0].value;
    combi = decomp[1].value;

    asyncWait.classList.add("asyncinvisible");

    setTimeout(() => {
      asyncWait.classList.remove("asyncvisible", "asyncinvisible");
      uploadForm.reset();
      uploadForm.classList.add("asyncvisible");
    }, 500);
  }
  catch (error) {
    asyncWait.classList.add("asyncinvisible");

    setTimeout(() => {
      asyncWait.classList.remove("asyncvisible", "asyncinvisible");
      asyncTrace.innerHTML = error.message;
      asyncFail.classList.add("asyncvisible");
    }, 500);
  }
}

gci.addEventListener("change", (gciEvent) => {
  gciLoad(gciEvent);
});

map.addEventListener("click", (clickEvent) => {
  const acre = clickEvent.target.closest(".acre");

  if (acre != null) {
    clickEvent.preventDefault();
    const acreID = acre.getAttribute("data-acreid");
    const arrayID = acre.getAttribute("data-arrayid");
    const bgType = acre.getAttribute("data-bgtype");

    if (bgType != null) {
      navigator.clipboard.writeText(bgType);
      console.log("Copied to clipboard: " + bgType + " (" + acreID + ", " + arrayID + ")");
      acre.classList.add("selected");

      setTimeout(() => {
        acre.classList.remove("selected");
      }, 250);
    }
  }
});

map.addEventListener("contextmenu", (contextEvent) => {
    contextEvent.preventDefault();
});

setTimeout(() => {
  asyncWait.classList.add("asyncvisible");
  setTimeout(() => {
    treehut();
  }, 1000);
}, 250);


function gciLoad(event) {
  const reader = new FileReader();
  map.innerHTML = "";
  uploads = event.target.files;
  uploadedFile = uploads[0]

  reader.readAsArrayBuffer(uploadedFile);

  reader.addEventListener("load", (loadEvent) => {
    const fileBuffer = loadEvent.target.result;
    const fileArray = new Uint8Array(fileBuffer);

    const gafStr = hexTools.getHexString(fileArray, 0x00, 0x06);
    const gafTest = /GA[EF][EJPU]01/.test(gafStr);

    const muraStr = hexTools.getHexString(fileArray, 0x08, 0x1B);
    const muraTest = /Dobutsunomori[PE]_MURA/.test(muraStr);
    
    let acStr = "Animal Crossing (USA)";
    let startOffset = 0x26040;
    let acreOffset = 0x173A8;
    let acreSize = 0x8C;
    let townOffset = 0x137A8;
    let townSize = 0x3C00;

    switch(gafStr) {
      case "GAFJ01":
        acStr = "Dōbutsu no Mori+";
        startOffset = 0x2040;
        acreOffset = 0x13EE8;
        townOffset = 0x102E8;
        break;
      case "GAEJ01":
        acStr = "Dōbutsu no Mori e+";
        startOffset = 0x10040;
        acreOffset = 0x1C0C0;
        townOffset = 0x184C0;
        break;
      case "GAFP01":
        acStr = "Animal Crossing (EUR)";
        break;
      case "GAFU01":
        acStr = "Animal Crossing (AUS)";
        break;
    }
        
    if (gafTest == false || muraTest == false) {
      setMessage("This file is invalid.", "red");
      return;
    }

    setMessage("This file is valid. (" + acStr + " / " + gafStr + ", " + muraStr + ")", "green");

    let startAcreHex = startOffset + acreOffset;
    let endAcreHex = startAcreHex + acreSize;
    getAcreData(fileArray, startAcreHex, endAcreHex, gafStr);

    let startTownHex = startOffset + townOffset;
    let endTownHex = startTownHex + townSize;
    townData = getAcreItems(fileArray, startTownHex, endTownHex, 30);
  });
}

function setMessage(message, color) {
  msg.innerText = message;
  msg.style.color = color;
}

function getAcreData(array, start, end, gafStr) {
  const hex = hexTools.getHex(array, start, end);
  
  if (hex.length / 2 != 70) {
    setMessage("The acre data for this save file is invalid.", "red");
    return;
  }

  const ctBlockMatch = combi.match(/data_combi_table\s*\[\s*\]\s*=\s*\{\s*([\s\S]*?)\s*\};/);
  const ctContent = ctBlockMatch[1];

  let acreHex = new Array(70);
  let acreHexIdx = 0;

  let ctItems = ctContent.match(/BG_TYPE_\w+/g);

  for (let i = 0; i < hex.length; i += 2) {
    acreHex[acreHexIdx] = hexTools.getBytePairs(hex, i);
    acreHexIdx += 1;
  }

  let townGrid = document.createElement("div");
  let unknownTiles = new Array;

  let townAcreIdx = 0;

  for (let i = 0; i < acreHex.length; i++) {
    let acre = document.createElement("div");
    let row = Math.floor(i / 7) + 1;
    let col = (i % 7) + 1;
    let skip = false;
    
    if (row == 1 || row >= 8){
      skip = true;
    }
    else if (row >= 2 && row <= 7 && (col == 1 || col == 7)){
      skip = true;
    }

    if (skip == false) {
      let acreHexElevation = acreHex[i];
      let acreHexBase = "0x" + (acreHexElevation & 0xFFFC).toString(16).padStart(4, "0").toUpperCase();
      let arrayIndex = (acreHexBase >> 2);
      let ctName = ctItems[arrayIndex];

      acre.className = "acre";
      acre.setAttribute("data-acreid", acreHexBase);
      acre.setAttribute("data-arrayid", arrayIndex);
      acre.setAttribute("data-bgtype", ctName);
      acre.setAttribute("data-edge", "none");

      const bgBlockMatch = bgdata.match(RegExp("(" + ctName + ")[\\s\\S]*?(\\{[\\s\\S]*?\\}\\s*,\\s*\\}\\s*,\\s*\\})\\s*(?=,)"));
      const bgContent = bgBlockMatch[2];
      const bgAttribs = bgContent.match(/mCoBG_ATTRIBUTE_\w+/g);

      let tiles = "<svg viewBox=\"0 0 16 16\" width=\"100%\" height=\"100%\">";

      for (let i = 0; i < bgAttribs.length; i++) {
        const tileX = i % 16;
        const tileY = Math.floor(i / 16);
        const tileColor = getTileColor(bgAttribs[i]);
        
        if (tileColor == "rgb(230, 50, 230)") {
          unknownTiles.push(bgAttribs[i]);
        }

        tiles += "<rect x=\"" + tileX + "\" y=\"" + tileY + "\" width=\"1.05\" height=\"1.05\" fill=\"" + tileColor + "\" data-tiletype=\"" + bgAttribs[i] + "\"/>";
      }

      tiles += "</svg>";
      acre.innerHTML = tiles;

      if (col == 2) {
        acre.setAttribute("data-edge", "left");
      }
      else if (col == 6) {
        acre.setAttribute("data-edge", "right");
      }

      acre.setAttribute("data-acre", String.fromCharCode(64 + (row - 1)) + (col - 1));
      acre.setAttribute("data-townacre-idx", townAcreIdx);

      townGrid.append(acre);
      townAcreIdx += 1;
    }
  }

  townGrid.id = "towngrid";
  map.innerHTML = "<h2>Town Map</h2>";
  map.appendChild(townGrid);

  unknownTiles = Array.from(new Set(unknownTiles));

  if(unknownTiles.length > 0) {
    unknownTiles = unknownTiles.sort();
    for (let i = 0; i < unknownTiles.length; i++) {
      console.log("Unknown tile type: " + unknownTiles[i]);
    }
  }
}

const tileColorRules = [
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

function getTileColor(bgType) {
  for (const rule of tileColorRules) {
    if (rule.match.test(bgType)) {
      return rule.color;
    }
  }

  return "rgb(255, 255, 255)";
}

function getAcreItems(array, start, end, acres) {
  const hex = hexTools.getHex(array, start, end);
  
  if (hex.length / 2 / 256 != acres) {
    setMessage("The acre item data is invalid.", "red");
    return;
  }

  let acreArray = new Array(acres);
  let hexIdx = 0;

  for (let i = 0; i < acreArray.length; i++) {
    let acre = new Array(256);

    for (let j = 0; j < acre.length; j++) {
      acre[j] = hexTools.getBytePairs(hex, hexIdx);
      hexIdx += 2;
    }

    acreArray[i] = acre;
  }

  return acreArray;
}
