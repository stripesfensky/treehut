import * as common from "./common.js";
import * as hex from "./hex.js";
import * as field from "./field.js";

export async function loadGci(fieldInfo, gciUpload) {
  const gciFileBuffer = await gciUpload.target.files[0].arrayBuffer();
  const gciUint8Array = new Uint8Array(gciFileBuffer);
  const gciGameCode = hex.getHexString(gciUint8Array, 0x00, 0x06);
  const gciFileName = hex.getHexString(gciUint8Array, 0x08, 0x1B);

  let saveData;

  if (/GA[DEF][EJPU][0X][1X]/.test(gciGameCode) && /Dobutsunomori[PE]_MURA/.test(gciFileName)) {
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
  }
  else {
    common.setMessage("<b>ERROR:</b> This file is invalid.", "red");
  }

  return saveData;
}

function getSaveData(fieldInfo, saveAcreData, saveTownData) {
  if (saveAcreData.length / 2 != 70) {
    common.setMessage("The acre data for this save file is invalid.", "red");
    return;
  }

  if (saveTownData.length / 256 / 2 != 30 ) {
    common.setMessage("The foreground data for this save file is invalid.", "red");
    return;
  }

  let acres = new Array(30);
  let acreLocationIndex = 0;
  let acreArrayIndex = 0;

  for (let i = 0; i < saveAcreData.length; i += 2) {
    let acre = hex.getBytePairs(saveAcreData, i);
    let acreStrId = acre.toString(16);
    let acreIntId = hex.getBytePairs(saveAcreData, i) >> 2;
    let acreBackgroundType = fieldInfo.find(fi => fi.indices.includes(acreIntId));
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
