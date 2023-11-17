import React from "react";
import { Container } from "semantic-ui-react";
import PropTypes from "prop-types";
import { compose, mapProps } from "recompose";

import { chooseTranslation as T } from "api/i18n";
import LangsNavAutocomplete from "components/Home/components/LangsNav/LangsNavAutocomplete/index";
import LangsNavList from "components/Home/components/LangsNav/LangsNavList/index";

import { sortLangsAlphabetically } from "../../common";

/* ----------- COMPONENT HELPERS ----------- */
const prepareData = (resultData, language) => {
  const resultDictsCount = {
    dicts: 0,
    corps: 0
  };

  // counting all dictionaries
  if (language.children.length > 0) {
    language.children.forEach(item => {
      if (item.type === "dictionary") {
        if (item.category === 0) {
          resultDictsCount.dicts += 1;
        } else if (item.category === 1) {
          resultDictsCount.corps += 1;
        } else if (item.category === 2) {
          resultDictsCount.dicts += 1;
        }
      } else if (item.type === "language") {
        const itemDictsCount = prepareData(resultData, item);

        resultDictsCount.dicts += itemDictsCount.dicts;
        resultDictsCount.corps += itemDictsCount.corps;
      }
    });
  }

  // eslint-disable-next-line no-param-reassign
  language.dictsCount = resultDictsCount;

  if (language.type === "language") {
    resultData.push(language);
  }

  return resultDictsCount;
};

const makeLetterMap = data =>
  data.reduce((acc, cur) => {
    const letter = T(cur.translations)[0].toLocaleUpperCase();

    if (acc[letter]) {
      acc[letter].push(cur);
    } else {
      acc[letter] = [cur];
    }

    return acc;
  }, {});

/* ----------- ENHANCERS ----------- */
const propsHandler = mapProps(({ data, ...rest }) => {
  const preparedData = [];

  data.toJS().forEach(language => prepareData(preparedData, language));
  preparedData.sort(sortLangsAlphabetically);

  const filteredData = preparedData.filter(language => language.in_toc);
  const listData = Object.entries(makeLetterMap(filteredData));

  return {
    ...rest,
    autocompleteData: preparedData,
    listData
  };
});

const enhance = compose(propsHandler);

/* ----------- COMPONENT ----------- */
const LangsNav = ({ autocompleteData, listData }) => (
  <>
    <Container>
      <LangsNavAutocomplete data={autocompleteData} />
    </Container>
    <LangsNavList data={listData} />
  </>
);

/* ----------- PROPS VALIDATION ----------- */
LangsNav.propTypes = {
  autocompleteData: PropTypes.array.isRequired,
  listData: PropTypes.array.isRequired
};

export default enhance(LangsNav);
