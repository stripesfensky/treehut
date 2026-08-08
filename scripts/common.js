let msg = document.getElementById("msg");

export function setMessage(message, color) {
  if (msg != null) {
    msg.innerHTML = message;
    msg.style.color = color;
  }
}
