import * as fieldInfo from "./inc/fieldInfo.js";
import * as fieldUtils from "./inc/fieldUtils.js";
import * as gciUtils from "./inc/gciUtils.js";
import * as hexUtils from "./inc/hexUtils.js";

let upload = document.getElementById("upload");
let gci = document.getElementById("gci");
let msg = document.getElementById("msg");
let map = document.getElementById("map");

upload.reset();

let fieldInfoStore = await fieldInfo.getFieldInfo();

if (fieldInfoStore != null) {
  gci.style.display = "block";
}
else {
  setMessage(msg, "<b>ERROR:</b> There was an error loading the source data; please try again another time.", "red");
}

gci.addEventListener("change", async (gciUpload) => {
  map.innerHTML = "";
  msg.innerHTML = "";

  let gciData = await gciUtils.loadGci(gciUpload);
  
  if(gciData != null){
    setMessage(msg, "<b>SUCCESS:</b> This file is valid. [" + gciData[0] + " / " + gciData[1] + ", " + gciData[2] + "]", "green");
    getAcreData(gciData[8], gciData[3] + gciData[4], gciData[3] + gciData[4] + gciData[5]);
  }
  else {
    setMessage(msg, "<b>ERROR:</b> This file is invalid.", "red");
  }
});

map.addEventListener("contextmenu", (mapContextMenu) => {
  mapContextMenu.preventDefault();
});

map.addEventListener("click", (acreSelect) => {
  const selectedAcre = acreSelect.target.closest(".acre");
  selectedAcre.classList.add("selected");
  setTimeout(() => {
    selectedAcre.classList.remove("selected");
  }, 250);
});

function setMessage(msg, message, color) {
  msg.innerHTML = message;
  msg.style.color = color;
}

function getAcreData(array, start, end) {
  const sliced = hexUtils.getHexSlice(array, start, end);
  
  if (sliced.length / 2 != 70) {
    setMessage(msg, "The acre data for this save file is invalid.", "red");
    return;
  }

  let acres = new Array(70);
  let acresIndex = 0;

  for (let i = 0; i < sliced.length; i += 2) {
    let acre = hexUtils.getBytePairs(sliced, i);
    let acreStrId = acre.toString(16);
    let acreIntId = hexUtils.getBytePairs(sliced, i) >> 2;
    let acreFieldInfo = fieldInfoStore.find(fi => fi.indices.includes(acreIntId));

    acres[acresIndex] = acreFieldInfo;
    acresIndex += 1;
  }

  let townGrid = document.createElement("div");
  let townAcresIndex = 0;

  for (let i = 0; i < acres.length; i++) {
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
      let acreFieldInfo = acres[i];

      acre.className = "acre";
      acre.setAttribute("data-location", String.fromCharCode(64 + (row - 1)) + (col - 1));
      acre.setAttribute("data-fieldinfo", acreFieldInfo.name);
      acre.setAttribute("data-edge", "none");

      let tiles = "<svg viewBox=\"0 0 16 16\" width=\"100%\" height=\"100%\">";

      for (let i = 0; i < acreFieldInfo.backgroundTiles.length; i++) {
        const tileX = i % 16;
        const tileY = Math.floor(i / 16);
        const tileColor = acreFieldInfo.backgroundTiles[i].color;
        
        tiles += "<rect x=\"" + tileX + "\" y=\"" + tileY + "\" width=\"1.05\" height=\"1.05\" fill=\"" + tileColor + "\"/>";
      }

      tiles += "</svg>";
      acre.innerHTML = tiles;

      if (col == 2) {
        acre.setAttribute("data-edge", "left");
      }
      else if (col == 6) {
        acre.setAttribute("data-edge", "right");
      }

      townGrid.append(acre);
      townAcresIndex += 1;
    }
  }

  townGrid.id = "towngrid";
  map.innerHTML = "<hr /><h2>Town Map</h2>";
  map.appendChild(townGrid);
}
