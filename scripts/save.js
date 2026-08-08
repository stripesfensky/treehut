import * as common from "./common.js";
import * as hex from "./hex.js";
import * as field from "./field.js";

export async function loadSave(fieldInfo, gciUpload) {
  if (gciUpload == null) {
    common.setMessage("<b>ERROR:</b> The uploaded file cannot be read.", "red");
    return;
  }

  const gciFileBuffer = await gciUpload.target.files[0].arrayBuffer();
  const gciUint8Array = new Uint8Array(gciFileBuffer);
  const gciGameCode = hex.getHexString(gciUint8Array, 0x00, 0x06);
  const gciFileName = hex.getHexString(gciUint8Array, 0x08, 0x1B);

  let saveData;

  if (!(/GA[DEF][EJPU][0X][1X]/.test(gciGameCode) && /Dobutsunomori[PE]_MURA/.test(gciFileName))) {
    common.setMessage("<b>ERROR:</b> The uploaded file is not a properly formatted save file.", "red");
    return;
  }

  let gameStr = "Animal Crossing (USA)";
  let gciSaveOffset = 0x26040;
  let saveAcreOffset = 0x173A8;
  let saveAcreSize = 0x0008C;
  let saveTownOffset = 0x137A8;
  let saveTownSize = 0x03C00;

  switch(gciGameCode) {
    case "GAFJ01":
      gameStr = "Doubutsu no Mori+";
      gciSaveOffset = 0x02040;
      saveAcreOffset = 0x13EE8;
      saveTownOffset = 0x102E8;
      break;
    case "GAEJ01":
      gameStr = "Doubutsu no Mori e+";
      gciSaveOffset = 0x10040;
      saveAcreOffset = 0x1C0C0;
      saveTownOffset = 0x184C0;
      break;
    case "GAFP01":
      gameStr = "Animal Crossing (EUR)";
      break;
    case "GAFU01":
      gameStr = "Animal Crossing (AUS)";
      break;
    case "GADEXX":
      gameStr = "Animal Crossing Deluxe v41.0+";
      gciSaveOffset = 0x10040;
      saveAcreOffset = 0x173A8;
      break;
  }

  common.setMessage("<b>SUCCESS:</b> This file is valid. [" + gameStr + " / " + gciGameCode + "]", "green");

  let saveAcreStart = gciSaveOffset + saveAcreOffset;
  let saveAcreEnd = saveAcreStart + saveAcreSize;
  let saveAcreData = hex.getHexSlice(gciUint8Array, saveAcreStart, saveAcreEnd);

  let saveTownStart = gciSaveOffset + saveTownOffset;
  let saveTownEnd = saveTownStart + saveTownSize;
  let saveTownData = hex.getHexSlice(gciUint8Array, saveTownStart, saveTownEnd);

  saveData = getSaveData(fieldInfo, saveAcreData, saveTownData);

  return saveData;
}

function getSaveData(fieldInfo, saveAcreData, saveTownData) {
  if (saveAcreData.length != 140) {
    common.setMessage("The acre data for this save file is invalid.", "red");
    return;
  }

  if (saveTownData.length != 15360 ) {
    common.setMessage("The foreground data for this save file is invalid.", "red");
    return;
  }

  let town = [];
  let townDataIndex = 0;
  
  for (let i = 0; i < 30; i++) {
    let items = [];

    for (let j = 0; j < 256; j++) {
      let itemStrId = hex.getBytePairs(saveTownData, townDataIndex);
      items[j] = itemStrId;
      townDataIndex += 2;
    }
    
    town[i] = items;
  }

  const fieldInfoMap = new Map();

  for (const fi of fieldInfo) {
    for (const idx of fi.indices) {
      fieldInfoMap.set(idx, fi);
    }
  }

  let acres = [];
  let acreLocationIndex = 0;
  let acreArrayIndex = 0;

  for (let i = 0; i < saveAcreData.length; i += 2) {
    let acreIntId = parseInt(hex.getBytePairs(saveAcreData, i), 16) >> 2;
    let acreBackgroundType = fieldInfoMap.get(acreIntId);
    let acreRow = Math.floor(acreLocationIndex / 7) + 1;
    let acreColumn = (acreLocationIndex % 7) + 1;

    if ((acreRow >= 2 && acreRow <= 7) && (acreColumn >= 2 && acreColumn <= 6)) {
      let acreName = String.fromCharCode(64 + (acreRow - 1)) + (acreColumn - 1);
      let acreEdge = "";
      if (acreColumn == 2) {
        acreEdge = "left";
      }
      else if (acreColumn == 6) {
        acreEdge = "right";
      }

      acres[acreArrayIndex] = new field.Acre(acreName, acreEdge, acreBackgroundType);
      acreArrayIndex += 1;
    }

    acreLocationIndex += 1;
  }

  return acres;
}
