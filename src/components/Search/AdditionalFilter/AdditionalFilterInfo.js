import React from 'react';
import PropTypes from 'prop-types';

const classNames = {
  container: 'additional-filter__info',
  field: 'additional-filter__info-field',
  header: 'additional-filter__info-header',
};

const isValueString = (value) => {
  return Object.prototype.toString.call(value) === '[object String]';
};

const isValueArray = (value) => {
  return Object.prototype.toString.call(value) === '[object Array]';
};

const isValueBoolean = (value) => {
  return Object.prototype.toString.call(value) === '[object Boolean]';
};

const info = (value) => {
  let result = '';

  if (isValueString(value)) {
    result = value;
  }

  if (isValueArray(value)) {
    if (value.length > 5) {
      result = `${value.length} items`;
    } else {
      result = value.reduce((accumulator, currentValue, currentIndex, array) => {
        if (accumulator === '' && currentIndex + 1 !== array.length) {
          return `${currentValue}, `;
        }

        if (currentIndex + 1 === array.length) {
          return `${accumulator}${currentValue}`;
        }

        return `${accumulator}${currentValue}, `;
      }, '');
    }
  }

  if (isValueBoolean(value)) {
    result = value ? 'yes' : 'no';
  }

  return result;
};

const kindInfo = (kind) => {
  let result = '';

  if (kind === null) {
    result = info('Not chosen');
  } else {
    result = info(kind);
  }

  return `Data source: ${result}`;
};

const hasAudioInfo = (hasAudio) => {
  let result = '';

  if (hasAudio === null) {
    result = info('Not chosen');
  } else {
    result = info(hasAudio);
  }

  return `Audio: ${result}`;
};

const yearsInfo = (years) => {
  let result = '';

  if (years.length === 0) {
    result = info('Not chosen');
  } else {
    result = info(years);
  }

  return `Years: ${result}`;
};

const humanSettlementInfo = (humanSettlement) => {
  let result = '';

  if (humanSettlement.length === 0) {
    result = info('Not chosen');
  } else {
    result = info(humanSettlement);
  }

  return `Human settlement: ${result}`;
};

const authorsInfo = (authors) => {
  let result = '';

  if (authors.length === 0) {
    result = info('Not chosen');
  } else {
    result = info(authors);
  }

  return `Authors: ${result}`;
};

const languageVulnerabilityInfo = (languageVulnerability) => {
  let result = '';

  if (languageVulnerability.length === 0) {
    result = info('Not chosen');
  } else {
    result = info(languageVulnerability);
  }

  return `Language vulnerability: ${result}`;
};

const languagesInfo = (languages) => {
  const result = `${languages.length} items`;

  return `Languages: ${result}`;
};

const dictionariesInfo = (dictionaries) => {
  const result = `${dictionaries.length} items`;

  return `Dictionaries: ${result}`;
};

const AdditionalFilterInfo = (props) => {
  const {
    languages, dictionaries, hasAudio, kind, years,
    humanSettlement, authors, languageVulnerability,
    getTranslation,
  } = props;

  const selectedText = getTranslation('You have selected:');

  return (
    <div className={classNames.container}>
      <div className={classNames.header}>{selectedText}</div>
      <div className={classNames.field}>{languagesInfo(languages)}</div>
      <div className={classNames.field}>{dictionariesInfo(dictionaries)}</div>
      <div className={classNames.field}>{hasAudioInfo(hasAudio)}</div>
      <div className={classNames.field}>{kindInfo(kind)}</div>
      <div className={classNames.field}>{yearsInfo(years)}</div>
      <div className={classNames.field}>{humanSettlementInfo(humanSettlement)}</div>
      <div className={classNames.field}>{authorsInfo(authors)}</div>
      <div className={classNames.field}>{languageVulnerabilityInfo(languageVulnerability)}</div>
    </div>
  );
};

AdditionalFilterInfo.propTypes = {
  languages: PropTypes.array.isRequired,
  dictionaries: PropTypes.array.isRequired,
  hasAudio: PropTypes.bool,
  kind: PropTypes.string,
  years: PropTypes.array.isRequired,
  humanSettlement: PropTypes.array.isRequired,
  authors: PropTypes.array.isRequired,
  languageVulnerability: PropTypes.array.isRequired,
  getTranslation: PropTypes.func.isRequired,
};

export default AdditionalFilterInfo;