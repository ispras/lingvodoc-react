// more minimal version of https://github.com/olahol/scrollparent.js/blob/master/scrollparent.js
const regex = /(auto|scroll)/;

const style = (elem, prop) => getComputedStyle(elem, null).getPropertyValue(prop);

const scroll = elem =>
  regex.test(
    style(elem, "overflow") +
    style(elem, "overflow-y") +
    style(elem, "overflow-x"));

const scrollParent = elem =>
  !elem || elem === document.body
  ? document.body
  : scroll(elem)
    ? elem
    : scrollParent(elem.parentElement);

export default scrollParent;