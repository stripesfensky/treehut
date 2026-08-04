export function getHex(array, start, end) {
  const sliced = array.slice(start, end);
  let hexArray = new Array();

  for (let i = 0; i < sliced.length; i++) {
    const hex = sliced[i].toString(16).padStart(2, "0").toUpperCase();
    hexArray.push(hex);
  }

  return hexArray;
}

export function getHexString(array, start, end) {
  const hex = getHex(array, start, end);
  let valueStr = "";

  for (let i = 0; i < hex.length; i++) {
    const strChar = String.fromCharCode(parseInt(hex[i], 16));
    valueStr += strChar;
  }
  
  return valueStr;
}

export function getBytePairs(hex, hexIdx) {
  const firstByte = hex[hexIdx].toString(16).padStart(2, "0").toUpperCase();
  const secondByte = hex[hexIdx + 1].toString(16).padStart(2, "0").toUpperCase();
  return "0x" + firstByte + secondByte;
}
