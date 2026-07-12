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

    let gafStr = getHexString(fileArray, "00000000", "00000005");
    let gafTest = RegExp("GAF\[A-Z]01").test(gafStr);
    let muraStr = getHexString(fileArray, "00000008", "0000001A");
    let muraTest = RegExp("DobutsunomoriP_MURA").test(muraStr);
    
    if (gafTest == false || muraTest == false) {
      setFileError("This file is invalid.", "red");
    }
    else {
      setFileError("This file is valid.", "green");
      getAcreHex(fileArray, "0003D3E8", "0003D473");
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
    setFileError("The acre data for this save file is invalid.");
    return;
  }

  let acreHex = new Array(70);
  let acreHexIdx = 0;

  for (let i = 0; i < sliced.length; i += 2) {
    const acreFirst = sliced[i].toString(16).padStart(2, "0").toUpperCase();
    const acreSecond = sliced[i + 1].toString(16).padStart(2, "0").toUpperCase();
    acreHex[acreHexIdx] = `0x${acreFirst}${acreSecond}`;
    acreHexIdx += 1;
  }

  console.log(acreHex);

  acreHexIdx = 0;

  let table = document.createElement("table");

  for (let mapRow = 0; mapRow < 10; mapRow++) {
    let row = table.insertRow(-1);
    
    for (let mapCol = 0; mapCol < 7; mapCol++) {
      let rowCol = row.insertCell(-1);
      rowCol.innerText = acreHex[acreHexIdx];
      acreHexIdx++;
    }
  }

  map.innerHTML = "<h2>Map</h2>"
  map.appendChild(table);
  return;
}