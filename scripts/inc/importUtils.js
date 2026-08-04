async function getSource(url) {
  const response = await fetch(url);
  if (response.status != 200) {
    console.error("Could not import \"" + url + "\" (status code: " + response.status + ")");
  } 
  else {
    console.info("Successfully imported \"" + url + "\"");
    return response.text();
  }
}

export async function returnSource(url) {
  const source = await getSource(url);
  return source;
}
