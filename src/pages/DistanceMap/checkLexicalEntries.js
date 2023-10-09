function checkLexicalEntries(word) {
  return /lexicalentries|лексическиевходы|leksikaalinenmerkinnät|lexikalischeeinträge/.test(
    word.toLowerCase().replace(/\s+/g, "").trim()
  );
}
export default checkLexicalEntries;
