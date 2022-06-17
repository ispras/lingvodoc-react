import React, { PureComponent } from "react";
import { Button } from "semantic-ui-react";
import PropTypes from "prop-types";

import TranslationContext from "Layout/TranslationContext";

import info, { isValueBoolean } from "./info";

const authorsInfo = (authors, getTranslation) => {
  let result = "";

  if (authors.length === 0) {
    result = info(getTranslation("Not chosen"), getTranslation);
  } else {
    result = info(authors, getTranslation);
  }

  return `${getTranslation("Authors")}: ${result}`;
};

const dictionariesInfo = (dictionaries, getTranslation) => {
  const result = `${dictionaries.length} ${getTranslation("selected")}`;
  return `${getTranslation("Dictionaries")}: ${result}`;
};

const grammarGroupInfo = (name, values, needComma, getTranslation) => {
  return (
    <span key={name}>
      <strong>{name}</strong>: {info(values, getTranslation)}
      {needComma ? ", " : ""}
    </span>
  );
};

const grammarInfo = (grammar, onClickCallback, getTranslation) => {
  const grammarText = Object.keys(grammar).map((grammarGroupName, index, array) => {
    const grammarGroupValues = Object.keys(grammar[grammarGroupName]);
    let needComma = false;

    if (index + 1 !== array.length) {
      needComma = true;
    }

    return grammarGroupInfo(grammarGroupName, grammarGroupValues, needComma, getTranslation);
  });

  let result = grammarText;

  if (grammarText.length === 0) {
    result = getTranslation("Not chosen");
  }

  return (
    <div>
      {getTranslation("Grammar")}: <a onClick={onClickCallback}>{result}</a>
    </div>
  );
};

const hasAudioInfo = (hasAudio, getTranslation) => {
  let result = "";

  if (hasAudio === null) {
    result = info(getTranslation("Not chosen"), getTranslation);
  } else {
    result = info(hasAudio, getTranslation);
  }

  return `${getTranslation("Audio")}: ${result}`;
};

const humanSettlementInfo = (humanSettlement, getTranslation) => {
  let result = "";

  if (humanSettlement.length === 0) {
    result = info(getTranslation("Not chosen"), getTranslation);
  } else {
    result = info(humanSettlement, getTranslation);
  }

  return `${getTranslation("Settlement")}: ${result}`;
};

const kindInfo = (kind, getTranslation) => {
  let result = "";

  if (isValueBoolean(kind)) {
    if (kind === false) {
      result = info(getTranslation("Not chosen"), getTranslation);
    }
  } else {
    result = info(kind, getTranslation);
  }

  return `${getTranslation("Data source")}: ${result}`;
};

const languagesInfo = (languages, getTranslation) => {
  const result = `${languages.length} ${getTranslation("selected")}`;
  return `${getTranslation("Languages")}: ${result}`;
};

const languageVulnerabilityInfo = (languageVulnerability, getTranslation) => {
  let result = "";

  if (languageVulnerability.length === 0) {
    result = info(getTranslation("Not chosen"), getTranslation);
  } else {
    result = info(languageVulnerability, getTranslation);
  }

  return `${getTranslation("Language degree of endangerment")}: ${result}`;
};

const yearsInfo = (years, getTranslation) => {
  let result = "";

  if (years.length === 0) {
    result = info(getTranslation("Not chosen"), getTranslation);
  } else {
    result = info(years, getTranslation);
  }

  return `${getTranslation("Years")}: ${result}`;
};

const classNames = {
  container: "additional-filter__info",
  field: "additional-filter__info-field",
  header: "additional-filter__info-header",
  data: "additional-filter__info-data",
  toggleButton: "additional-filter__info-button",
  toggleButtonShow: "additional-filter__info-button_show lingvo-button-violet",
  toggleButtonClose: "additional-filter__info-button_close lingvo-button-basic-black"
};

const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

class AdditionalFilterInfo extends PureComponent {
  constructor() {
    super();

    this.state = {
      showInfo: false
    };

    this.onShowToggle = this.onShowToggle.bind(this);
  }

  onShowToggle() {
    this.setState({
      showInfo: !this.state.showInfo
    });
  }

  render() {
    const {
      languages,
      dictionaries,
      hasAudio,
      kind,
      years,
      humanSettlement,
      authors,
      languageVulnerability,
      grammaticalSigns,
      onClickCallbacks,
      isDataDefault
    } = this.props;
    const { showInfo } = this.state;

    const selectedText = `${capitalizeFirstLetter(this.context("selected"))}:`;
    const defaultSelectedText = `${capitalizeFirstLetter(this.context("selected by default"))}:`;
    const showText = this.context("Show");
    const closeText = this.context("Close");
    const buttonText = showInfo ? closeText : showText;
    const buttonClassName = showInfo
      ? `${classNames.toggleButton} ${classNames.toggleButtonClose}`
      : `${classNames.toggleButton} ${classNames.toggleButtonShow}`;

    const grammarClickCallback = onClickCallbacks.grammar || null;

    return (
      <div className={classNames.container}>
        <span>{isDataDefault ? defaultSelectedText : selectedText}</span>
        <Button onClick={this.onShowToggle} className={buttonClassName}>
          {buttonText}
        </Button>
        {showInfo ? (
          <div className={classNames.data}>
            <div className={classNames.field}>{languagesInfo(languages, this.context)}</div>
            <div className={classNames.field}>{dictionariesInfo(dictionaries, this.context)}</div>
            <div className={classNames.field}>{hasAudioInfo(hasAudio, this.context)}</div>
            <div className={classNames.field}>{kindInfo(kind, this.context)}</div>
            <div className={classNames.field}>{yearsInfo(years, this.context)}</div>
            <div className={classNames.field}>{humanSettlementInfo(humanSettlement, this.context)}</div>
            <div className={classNames.field}>{authorsInfo(authors, this.context)}</div>
            <div className={classNames.field}>{languageVulnerabilityInfo(languageVulnerability, this.context)}</div>
            <div className={classNames.field}>{grammarInfo(grammaticalSigns, grammarClickCallback, this.context)}</div>
          </div>
        ) : null}
      </div>
    );
  }
}

AdditionalFilterInfo.contextType = TranslationContext;

AdditionalFilterInfo.propTypes = {
  languages: PropTypes.array.isRequired,
  dictionaries: PropTypes.array.isRequired,
  hasAudio: PropTypes.bool,
  kind: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  years: PropTypes.array.isRequired,
  humanSettlement: PropTypes.array.isRequired,
  authors: PropTypes.array.isRequired,
  languageVulnerability: PropTypes.array.isRequired,
  grammaticalSigns: PropTypes.object.isRequired,
  isDataDefault: PropTypes.bool.isRequired,
  onClickCallbacks: PropTypes.object.isRequired
};

export default AdditionalFilterInfo;
