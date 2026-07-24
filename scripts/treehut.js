const msg = document.getElementById("msg");
const gci = document.getElementById("gci");
const hex = document.getElementById("hex");
const map = document.getElementById("map");
const asyncWait = document.getElementById("asyncwait");
const asyncFail = document.getElementById("asyncfail");
const asyncTrace = document.getElementById("asynctrace");
const uploadForm = document.getElementById("upload");

const bgdataURL = "https://raw.githubusercontent.com/ACreTeam/ac-decomp/refs/heads/master/src/data/field/bg/acre/bg_data.c";
const combitypeURL = "https://raw.githubusercontent.com/ACreTeam/ac-decomp/refs/heads/master/include/m_combi_type.h";

let bgdata;
let combitype;
let uploads;
let uploadedFile;

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
  console.log("Loading was successful for URL\"" + url + "\"");

  return result;
}

async function treehut() {
  try {
    const decomp = await Promise.allSettled([getDecompSource(bgdataURL), getDecompSource(combitypeURL)]);
    const decompFailures = decomp.filter(r => r.status == "rejected");

    if (decompFailures.length > 0) {
      const errors = decompFailures.map(f => f.reason.message).join("<br /><br />");
      throw new Error(errors);
    }

    bgdata = decomp[0].value;
    combitype = decomp[1].value;

    asyncWait.style.opacity = 0;

    setTimeout(() => {
      asyncWait.style.display = "none";
      uploadForm.reset();
      uploadForm.style.display = "block";

      setTimeout(() => {
        uploadForm.style.opacity = 1;
      }, 50);
    }, 500);
  }
  catch (error) {
    asyncWait.style.opacity = 0;

    setTimeout(() => {
      asyncWait.style.display = "none";
      asyncFail.style.display = "block";
      asyncTrace.style.display = "block";
      asyncTrace.innerHTML = error.message;

      setTimeout(() => {
        asyncFail.style.opacity = 1;
        asyncTrace.style.opacity = 1;
      }, 50);
    }, 500);
  }
}

setTimeout(() => {
  asyncWait.style.opacity = 1;
  setTimeout(() => {
    treehut();
  }, 1500);
}, 500);

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

    let acreHexElevation = acreHex[i];
    let acreHexBase = "0x" + (acreHexElevation & ~0x0003).toString(16).padStart(4, "0").toUpperCase();
    let arrayIndex = (acreHexBase >> 2);

    acre.className = "acre";
    acre.innerText = acreHexElevation + "\n" + acreHexBase + "\n" + arrayIndex;
    mapGrid.append(acre);
  }

  mapGrid.id = "mapgrid";
  map.innerHTML = "<h2>Map</h2>";
  map.appendChild(mapGrid);
  return;
}
