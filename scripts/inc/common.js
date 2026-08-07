let msg = document.getElementById("msg");

export function setMessage(message, color) {
  msg.innerHTML = message;
  msg.style.color = color;
}
