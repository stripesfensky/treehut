import * as hexUtils from "./hexUtils.js";

export async function loadGci(gciUpload) {
  const gciFileBuffer = await gciUpload.target.files[0].arrayBuffer();
  const gciUint8Array = new Uint8Array(gciFileBuffer);
  const gciGameCode = hexUtils.getHexString(gciUint8Array, 0x00, 0x06);
  const gciFileName = hexUtils.getHexString(gciUint8Array, 0x08, 0x1B);

  let gciData;

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
        saveAcreOffset = 0x173A0;
        break;
    }

    gciData = [gameStr, gciGameCode, gciFileName, gciSaveOffset, saveAcreOffset, saveAcreSize, saveTownOffset, saveTownSize, gciUint8Array];
  }

  return gciData;
}
