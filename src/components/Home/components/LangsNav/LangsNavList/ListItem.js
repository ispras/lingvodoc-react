import React from "react";
import PropTypes from "prop-types";
import { compose, pure } from "recompose";

/* ----------- PROPS ----------- */
const classNames = {
  main: "langs-nav-list__item",
  letter: "langs-nav-list__letter",
  list: "langs-nav-list__item-list",
  innerItem: "langs-nav-list__inner-item",
  button: "langs-nav-list__button"
};

/* ----------- ENHANCERS ----------- */
const enhance = compose(pure);

/* ----------- COMPONENT ----------- */
const ListItem = ({ data, onLangSelect }) => {
  const letter = data[0];
  const list = data[1];

  const itemList = list.map((lang, index, arr) => {
    const thinSpace = "\u2009";
    let text = null;
    if (!lang.dictsCount.dicts) {
      text = `${lang.translation} [${lang.dictsCount.corps}]`;
    } else if (!lang.dictsCount.corps) {
      text = `${lang.translation} [${lang.dictsCount.dicts}]`;
    } else {
      text = `${lang.translation} [${lang.dictsCount.dicts}${thinSpace}|${thinSpace}${lang.dictsCount.corps}]`;
    }

    return (
      <li key={lang.id} className={classNames.innerItem}>
        <button className={classNames.button} data-id={lang.id} data-value={lang.translation} onClick={onLangSelect}>
          {text}
        </button>
        {`${index !== arr.length - 1 ? ", " : ""}`}
      </li>
    );
  });

  return (
    <div>
      {itemList.length > 0 ? (
        <div className={classNames.main}>
          <div className={classNames.letter}>{letter}</div>
          <ul className={classNames.list}>{itemList}</ul>
        </div>
      ) : null}
    </div>
  );
};

/* ----------- PROPS VALIDATION ----------- */
ListItem.propTypes = {
  data: PropTypes.array.isRequired,
  onLangSelect: PropTypes.func.isRequired
};

export default enhance(ListItem);
