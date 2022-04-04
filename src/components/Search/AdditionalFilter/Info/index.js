import React, { PureComponent } from "react";
import { Button } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import PropTypes from "prop-types";

import authorsInfo from "./authors";
import dictionariesInfo from "./dictionaries";
import grammarInfo from "./grammar";
import hasAudioInfo from "./hasAudio";
import humanSettlementInfo from "./humanSettlement";
import kindInfo from "./kind";
import languagesInfo from "./languages";
import languageVulnerabilityInfo from "./languageVulnerability";
import yearsInfo from "./years";

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

    const selectedText = `${capitalizeFirstLetter(getTranslation("selected"))}:`;
    const defaultSelectedText = `${capitalizeFirstLetter(getTranslation("selected by default"))}:`;
    const showText = getTranslation("Show");
    const closeText = getTranslation("Close");
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
            <div className={classNames.field}>{languagesInfo(languages)}</div>
            <div className={classNames.field}>{dictionariesInfo(dictionaries)}</div>
            <div className={classNames.field}>{hasAudioInfo(hasAudio)}</div>
            <div className={classNames.field}>{kindInfo(kind)}</div>
            <div className={classNames.field}>{yearsInfo(years)}</div>
            <div className={classNames.field}>{humanSettlementInfo(humanSettlement)}</div>
            <div className={classNames.field}>{authorsInfo(authors)}</div>
            <div className={classNames.field}>{languageVulnerabilityInfo(languageVulnerability)}</div>
            <div className={classNames.field}>{grammarInfo(grammaticalSigns, grammarClickCallback)}</div>
          </div>
        ) : null}
      </div>
    );
  }
}

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
