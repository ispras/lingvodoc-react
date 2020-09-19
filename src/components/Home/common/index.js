import smoothScroll from 'utils/smoothscroll';

const classNames = {
  langHighlighted: 'highlighted',
  scrollContainer: 'pusher',
  mainHeader: 'menu',
};

const sortLangsAlphabetically = (first, second) => {
  const translationFirst = first.translation.toLocaleLowerCase();
  const translationSecond = second.translation.toLocaleLowerCase();

  if (translationFirst < translationSecond) {
    return -1;
  } else if (translationFirst > translationSecond) {
    return 1;
  }

  return 0;
};

const getLangElementId = id => `lang_${id.toString()}`;

const getScrollContainer = () => document.querySelector(`.${classNames.scrollContainer}`);

const getMainHeaderHeight = () => document.querySelector(`.${classNames.mainHeader}`).clientHeight;

const goToLanguage = (id) => {
  const el = document.getElementById(getLangElementId(id));
  const container = getScrollContainer(classNames.scrollContainer);
  const offsetTop = 160;

  smoothScroll(el.offsetTop - offsetTop, 500, null, container);

  el.classList.add(classNames.langHighlighted);

  setTimeout(() => {
    el.classList.remove(classNames.langHighlighted);
  }, 2000);
};

export {
  sortLangsAlphabetically,
  getLangElementId,
  getScrollContainer,
  goToLanguage,
  getMainHeaderHeight,
};
