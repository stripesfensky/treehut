const msg = document.getElementById("msg");
const gci = document.getElementById("gci");
const gciparser = document.getElementById("gciparser");
const hex = document.getElementById("hex");
const map = document.getElementById("map");
const debug = document.getElementById("debug");
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
      setMessage("This file is invalid.", "red");
    }
    else {
      setMessage("This file is valid. (" + acStr + " / " + gafStr + ", " + muraStr + ")", "green");

      if (gafStr == "GAEJ01") {
        getAcreHex(fileArray, "0002C100", "0002C18B");
      } 
      else if (gafStr == "GAFJ01") {
        getAcreHex(fileArray, "00015F28", "00015FB3");
      } 
      else {
        getAcreHex(fileArray, "0003D3E8", "0003D473");
      }

      if (gciparser.checked) {
        showDebugInfo(fileArray, gafStr);
      }

      gciparser.addEventListener("change", (event) => {
        showDebugInfo(fileArray, gafStr);
      });
    }

    return;
  });

  return;
});

function setMessage(message, color) {
    msg.innerText = message;
    msg.style.color = color;  
    return;
}

function getSlicedArray(array, startHex, endHex) {
  const start = parseInt(startHex, 16);
  const end = parseInt(endHex, 16);
  const sliced = array.slice(start, end + 1);
  return sliced;
}

function getHex(array, startHex, endHex) {
  const sliced = getSlicedArray(array, startHex, endHex);
  let hexArray = new Array();

  for (let i = 0; i < sliced.length; i++) {
    const hex = sliced[i].toString(16).padStart(2, "0").toUpperCase();
    hexArray.push(hex);
  }

  return hexArray;
}

function getHexString(array, startHex, endHex) {
  const hex = getHex(array, startHex, endHex);
  let valueStr = "";

  for (let i = 0; i < hex.length; i++) {
    const strChar = String.fromCharCode(parseInt(hex[i], 16));
    valueStr += strChar;
  }
  
  return valueStr;
}

function getAcreHex(array, startHex, endHex) {
  const hex = getHex(array, startHex, endHex);
  
  if (hex.length / 2 != 70) {
    setMessage("The acre data for this save file is invalid.", "red");
    return;
  }

  let acreHex = new Array(70);
  let acreHexIdx = 0;

  for (let i = 0; i < hex.length; i += 2) {
    const acreFirst = hex[i].toString(16).padStart(2, "0").toUpperCase();
    const acreSecond = hex[i + 1].toString(16).padStart(2, "0").toUpperCase();
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

function showDebugInfo(fileArray, gafStr) {
  debug.innerHTML = "";

  if (gciparser.checked) {
    debug.innerHTML = "<h2>Debug Information</h2>";
    
    if (gafStr != "GAFE01") {
      debug.innerHTML += "<p>Debug information is only available for GAFE01.</p>";
    } 
    else {
      let gameCode = getHexString(fileArray, "00000000", "00000003");
      console.log(gameCode);
      let makerCode = getHexString(fileArray, "00000004", "00000005");
      console.log(makerCode);
      let imageKey = getHex(fileArray, "00000007", "00000007");
      console.log(imageKey);
      let fileName = getHexString(fileArray, "00000008", "00000027");
      console.log(fileName);
      let lastModified = getHex(fileArray, "00000029", "0000002B");
      console.log(lastModified);
      let imageOffset = getHex(fileArray, "0000002C", "0000002F");
      console.log(imageOffset);
      let iconGFXFormat = getHex(fileArray, "00000030", "00000031");
      console.log(iconGFXFormat);
      let animationSpeed = getHex(fileArray, "00000032", "00000033");
      console.log(animationSpeed);
      let filePermissions = getHex(fileArray, "00000034", "00000034");
      console.log(filePermissions);
      let copyCounter = getHex(fileArray, "00000035", "00000035");
      console.log(copyCounter);
      let firstBlockNo = getHex(fileArray, "00000036", "00000037");
      console.log(firstBlockNo);
      let blockLength = getHex(fileArray, "00000038", "00000039");
      console.log(blockLength);
      let comment = getHex(fileArray, "0000003C", "0000003F");
      console.log(comment);
    }
  }

  return;
}