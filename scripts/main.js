import * as fieldInfo from "./inc/fieldInfo.js";
import * as gciUtils from "./inc/gciUtils.js";

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
