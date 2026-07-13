const fileError = document.getElementById("fileError");
const gci = document.getElementById("gci");
const hex = document.getElementById("hex");
const map = document.getElementById("map");
const uploadForm = document.getElementById("upload").reset();
let uploads;
let uploadedFile;

gci.addEventListener("change", (event) => {
  const reader = new FileReader();
  map.innerHTML = "";
  uploads = event.target.files;
  uploadedFile = uploads[0]

  reader.readAsArrayBuffer(uploadedFile);

  reader.addEventListener("load", (event) => {
    const fileBuffer = event.target.result;
    const fileArray = new Uint8Array(fileBuffer);

    let acStr = "Animal Crossing (USA)";

    let gafStr = getHexString(fileArray, "00000000", "00000005");
    let gafTest = RegExp("GA\[E,F]\[E,J,P,U]01").test(gafStr);
    let muraStr = getHexString(fileArray, "00000008", "0000001A");
    let muraTest = RegExp("Dobutsunomori\[P,E]_MURA").test(muraStr);

    switch(gafStr) {
      case "GAFJ01":
        acStr = "Dōbutsu no Mori+";
        break;
      case "GAEJ01":
        acStr = "Dōbutsu no Mori e+";
        break;
      case "GAFP01":
        acStr = "Animal Crossing (EUR)";
        break;
      case "GAFU01":
        acStr = "Animal Crossing (AUS)";
        break;
    }
        
    if (gafTest == false || muraTest == false) {
      setFileError("This file is invalid.", "red");
    }
    else {
      setFileError("This file is valid. (" + acStr + " / " + gafStr + ", " + muraStr + ")", "green");
      if (gafStr == "GAEJ01") {
        getAcreHex(fileArray, "0002C100", "0002C18B");
      } 
      else if (gafStr == "GAFJ01") {
        getAcreHex(fileArray, "00015F28", "00015FB3");
      } 
      else {
        getAcreHex(fileArray, "0003D3E8", "0003D473");
      }
    }

    return;
  });

  return;
});

function setFileError(message, color) {
    fileError.innerText = message;
    fileError.style.color = color;  
    return;
}

function getSlicedArray(array, startHex, endHex) {
  const start = parseInt(startHex, 16);
  const end = parseInt(endHex, 16);
  const sliced = array.slice(start, end + 1);
  return sliced;
}

function getHexString(array, startHex, endHex) {
  const sliced = getSlicedArray(array, startHex, endHex);
  let valueStr = "";

  for (let i = 0; i < sliced.length; i++) {
    const intChar = parseInt(sliced[i].toString(16), 16);
    const strChar = String.fromCharCode(intChar);
    valueStr += strChar;
  }
  
  return valueStr;
}

function getAcreHex(array, startHex, endHex) {
  const sliced = getSlicedArray(array, startHex, endHex);
  
  if (sliced.length / 2 != 70) {
    setFileError("The acre data for this save file is invalid.", "red");
    return;
  }

  let acreHex = new Array(70);
  let acreHexIdx = 0;

  for (let i = 0; i < sliced.length; i += 2) {
    const acreFirst = sliced[i].toString(16).padStart(2, "0").toUpperCase();
    const acreSecond = sliced[i + 1].toString(16).padStart(2, "0").toUpperCase();
    acreHex[acreHexIdx] = "0x" + acreFirst + acreSecond;
    acreHexIdx += 1;
  }

  let mapGrid = document.createElement("div");

  for (let i = 0; i < acreHex.length; i++) {
    let acre = document.createElement("div");
    acre.className = "acre";
    acre.innerText = acreHex[i];
    mapGrid.append(acre);
  }

  mapGrid.id = "mapgrid";
  map.innerHTML = "<h2>Map</h2>";
  map.appendChild(mapGrid);
  return;
}