
function checkLexicalEntries(word) {
  switch (word.toLowerCase().replace(/\s+/g, '').trim()) {
    case 'lexicalentries':
      return true;
    case 'лексическиевходы':
      return true;
    case 'leksikaalinenmerkinnät':
      return true;
    case 'lexikalischeeinträge':
      return true;
    default:
      return false;
  }
}
export default checkLexicalEntries;
