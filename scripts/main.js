import * as fieldInfo from "./inc/fieldInfo.js"

function setMessage(message, color) {
  msg.innerHTML = message;
  msg.style.color = color;
}

let fieldInfoStore = await fieldInfo.getFieldInfo();

if (fieldInfoStore != null) {
  let upload = document.getElementById("upload");
  upload.reset();
  
  let gci = document.getElementById("gci");
  gci.style.display = "block";
}
else {
  setMessage("<b>ERROR:</b> There was an error loading the source data; please try again another time.", "red");
}
