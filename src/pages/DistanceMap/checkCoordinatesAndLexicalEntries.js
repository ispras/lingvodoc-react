import checkLexicalEntries from "./checkLexicalEntries";

function checkCoorAndLexicalEntries(dict) {
  const newDict = dict.filter(el => {
    let statusLexicalEntries = false;
    const { location } = el.additional_metadata;
    el.perspectives.forEach(perspective => {
      if (checkLexicalEntries(perspective.translation)) {
        statusLexicalEntries = true;
      }
    });

    return location !== null && statusLexicalEntries;
  });
  return newDict;
}
export default checkCoorAndLexicalEntries;
