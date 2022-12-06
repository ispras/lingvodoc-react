import React, { useCallback, useContext, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Accordion, Transition } from "semantic-ui-react";

import Footer from "components/Footer";
import TranslationContext from "Layout/TranslationContext";

import imageAddFiles from "../../images/advantages_add_files.svg";
import imagePlanet from "../../images/advantages_planet.svg";
import imagePlayer from "../../images/advantages_player.svg";
import imageSearch from "../../images/advantages_search.svg";
import imageLanguages from "../../images/book_lover.svg";
import imageCreators from "../../images/conference_call.svg";
import imageSupport from "../../images/connecting.svg";
import imageMain from "../../images/image_main.svg";
import imageTools from "../../images/noted.svg";
import imageDashboard from "../../images/responsive.svg";
import imageGrants from "../../images/winners.svg";

import "./styles.scss";

const TopSectionSelector = () => {
  const { isAuthenticated } = useSelector(state => state.auth);

  const [activeIndexes, setActiveIndexes] = useState([]);
  const getTranslation = useContext(TranslationContext);

  const [visible, setVisible] = useState(false);

  const toggleVisibility = useCallback(
    () => {
      setVisible((prevState => !prevState));
    }
  );

  const handleClick = useCallback(
    (_e, titleProps) => {
      const { index } = titleProps;
      const pos = activeIndexes.indexOf(index);
      let newIndexes;
      if (pos !== -1) {
        newIndexes = activeIndexes.splice();
        newIndexes.splice(pos, 1);
      } else {
        newIndexes = activeIndexes.concat(index);
      }
      setActiveIndexes(newIndexes);
    },
    [activeIndexes]
  );

  return (
    <div className="lingvodoc-page">
      <div className="top-section-selector lingvodoc-page__content">
        <div className="background-main-page">
          <div className="main-page">
            <div className="top-section-selector_icon">
              <Link className="card-item" to="/language_databases">
                <label className="card-item__label">{getTranslation("Language databases")}</label>
                <img className="card-item__img card-item__img_languages" src={imageLanguages} />
              </Link>
              <Link className="card-item" to="/tools">
                <label className="card-item__label">{getTranslation("Tools")}</label>
                <img className="card-item__img" src={imageTools} />
              </Link>
              {isAuthenticated && (
                <Link className="card-item" to="/dashboard">
                  <label className="card-item__label">{getTranslation("Dashboard")}</label>
                  <img className="card-item__img" src={imageDashboard} />
                </Link>
              )}

              <Link className="card-item" to="/grants_info">
                <label className="card-item__label">{getTranslation("Grants")}</label>
                <img className="card-item__img card-item__img_grants" src={imageGrants} />
              </Link>
              <Link className="card-item" to="/authors">
                <label className="card-item__label">{getTranslation("Lingvodoc creators")}</label>
                <img className="card-item__img card-item__img_creators" src={imageCreators} />
              </Link>
              <Link className="card-item" to="/support">
                <label className="card-item__label">{getTranslation("Support")}</label>
                <img className="card-item__img card-item__img_support" src={imageSupport} />
              </Link>
            </div>
          </div>
        </div>

        <div className="lingvo-comm-bar">
          <div className={visible && "lingvo-comm-bar__title lingvo-comm-bar__title_visible" || "lingvo-comm-bar__title"} onClick={toggleVisibility}>
            <div className="lingvo-comm-bar__title-inner">
              <i className="lingvo-icon lingvo-icon_arrow" /> {getTranslation("For grantees and commercial use.")}
            </div>
          </div>
          <Transition visible={visible} duration={30}>
            <div className="lingvo-comm-bar__desc">
              <div className="lingvo-comm-bar__desc-inner">
                {getTranslation("If you receive a grant for the development of the platform or intend to use it")} <br />
                {getTranslation("for commercial purposes, you must sign an agreement with ISP RAS.")} <br /> 
                {getTranslation("To get an agreement, you need to")} <a href="https://docs.google.com/spreadsheets/d/1ZFDWxw42ArYzIBGmpDm2oQH0Wd0JJG7kc1-8YC2wxaI/edit?usp=sharing" target="_blank" rel="noreferrer">{getTranslation("register")}</a>.
              </div>
            </div>
          </Transition>
        </div>

        <div className="lingvo-main-block">
          <div className="lingvo-main-block__content">
            <h2 className="lingvo-main-block__title">{getTranslation("LingvoDoc is a linguistic platform.")}</h2>
            <div className="lingvo-main-block__subtit lingvo-main-block__subtit_platform">
              {getTranslation(
                "Designed for compiling, analyzing and storing dictionaries, corpora and concordances of various languages and dialects."
              )}
            </div>

            <div className="lingvo-main-block__platform">
              <div className="lingvo-main-block__platform-photo">
                <img className="lingvo-main-block__platform-img" src={imageMain} />
              </div>
              <div className="lingvo-main-block__platform-list">
                <div className="lingvo-main-block__platform-list-item">
                  <strong className="lingvo-main-block__platform-strong">
                    {getTranslation("It currently contains")}{" "}
                    <span className="lingvo-main-block__platform-text_violet">
                      {getTranslation("more than 1000 audio dictionaries")}
                    </span>{" "}
                    {getTranslation("and")}{" "}
                    <span className="lingvo-main-block__platform-text_violet">
                      {getTranslation("300 text corpora")}
                    </span>{" "}
                    {getTranslation("representing the dialects of various world languages")}.
                  </strong>
                </div>

                <div className="lingvo-main-block__platform-list-item">
                  <strong className="lingvo-main-block__platform-strong">
                    {getTranslation("It stores")}{" "}
                    <span className="lingvo-main-block__platform-text_violet">{getTranslation("unique data")}</span>{" "}
                    {getTranslation("on the endangered languages of Russia")}.
                  </strong>
                  <div className="lingvo-main-block__platform-desc">
                    {getTranslation(
                      "Many dialects have already disappeared, and the LingvoDoc platform holds data from archives, which are presently stacked and inaccessible."
                    )}
                  </div>
                </div>

                <div className="lingvo-main-block__platform-list-item">
                  <strong className="lingvo-main-block__platform-strong">
                    {getTranslation("It keeps records on some")}{" "}
                    <span className="lingvo-main-block__platform-text_violet">
                      {getTranslation("extinct languages")}
                    </span>
                  </strong>
                  <div className="lingvo-main-block__platform-desc">
                    {getTranslation(
                      "(for example, Eastern Mansi) as well as those that are in danger of extinction (that is, languages that have no more than 10 speakers over 60 years old left)."
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lingvo-main-block lingvo-main-block_advantages">
          <div className="lingvo-main-block__content">
            <h2 className="lingvo-main-block__title">{getTranslation("The pros of the LingvoDoc platform")}</h2>

            <div className="lingvo-main-block__advantages">
              <div className="lingvo-main-block__advantages-item">
                <img className="lingvo-main-block__advantages-img" src={imagePlanet} />
                <div className="lingvo-main-block__advantages-text">
                  {getTranslation("A chance for many researchers to work simultaneously and independently")}
                </div>
              </div>
              <div className="lingvo-main-block__advantages-item">
                <img className="lingvo-main-block__advantages-img" src={imageSearch} />
                <div className="lingvo-main-block__advantages-text">
                  {getTranslation("A possibility to automatically check for errors in the processed data")}
                </div>
              </div>
              <div className="lingvo-main-block__advantages-item">
                <img className="lingvo-main-block__advantages-img" src={imagePlayer} />
                <div className="lingvo-main-block__advantages-text">
                  {getTranslation(
                    "Unique software that reproduces the experimental-phonetic, etymological and morphological work of a researcher 100 times faster"
                  )}
                </div>
              </div>
              <div className="lingvo-main-block__advantages-item">
                <img className="lingvo-main-block__advantages-img" src={imageAddFiles} />
                <div className="lingvo-main-block__advantages-text">
                  {getTranslation(
                    "An option to create results of intellectual activity (RIAs) for the needs of writing reports and working with data"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lingvo-main-block">
          <div className="lingvo-main-block__content lingvo-main-block__opportunities">
            <h2 className="lingvo-main-block__title">{getTranslation("Opportunities")}</h2>
            <div className="lingvo-main-block__opportunities-info">
              <div className="lingvo-main-block__opportunities-details">
                {getTranslation("Follow the link to learn more about using these options:")}{" "}
                <a href="https://github.com/ispras/lingvodoc-react/wiki" target="_blank" rel="noreferrer">
                  https://github.com/ispras/lingvodoc-react/wiki
                </a>
                .
              </div>
            </div>

            <div className="lingvo-main-block__opportunities-list">
              <Accordion exclusive={false} fluid>
                <Accordion.Title
                  className="lingvo-main-block__opportunities-list-title"
                  active={activeIndexes.indexOf(0) !== -1 ? true : false}
                  index={0}
                  onClick={handleClick}
                >
                  {getTranslation("User options for working with dictionaries")} <i className="lingvo-icon-plus"></i>
                </Accordion.Title>
                <Accordion.Content
                  className="lingvo-main-block__opportunities-list-content"
                  active={activeIndexes.indexOf(0) !== -1 ? true : false}
                >
                  <ul className="lingvo-main-block__opportunities-full">
                    <li className="lingvo-main-block__opportunities-full-elem">
                      {getTranslation(
                        "creating any columns; adding any text, audio files, marking spectrograms using the Praat phonetic software; creating etymological connections between words from different dictionaries"
                      )}
                      ;
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                      {getTranslation(
                        "automatic segmentation of native speaker surveys, uploaded into the Telegram channel “LingvoDoc Support”, into separate words"
                      )}
                      ;
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                      {getTranslation(
                        "data processing and analysis software: phonetic analysis; search for etymologies; analysis of cognates in dialects and several languages; acoustic analysis of cognates; measuring phonological statistical distance; phonemic analysis; reconstruction of cognates in dialects and several languages"
                      )}
                      .
                    </li>
                  </ul>
                </Accordion.Content>

                <Accordion.Title
                  className="lingvo-main-block__opportunities-list-title"
                  active={activeIndexes.indexOf(1) !== -1 ? true : false}
                  index={1}
                  onClick={handleClick}
                >
                  {getTranslation("User options for working with text corpora")} <i className="lingvo-icon-plus"></i>
                </Accordion.Title>
                <Accordion.Content
                  className="lingvo-main-block__opportunities-list-content"
                  active={activeIndexes.indexOf(1) !== -1 ? true : false}
                >
                  <ul className="lingvo-main-block__opportunities-full">
                    <li className="lingvo-main-block__opportunities-full-elem">
                      {getTranslation(
                        "uploading audio files of any size, (audio)corpora in ELAN format, texts in Word .odt format"
                      )}
                      ;
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                      {getTranslation("automatic creation of dictionaries from text corpora")};
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                      {getTranslation(
                        "data processing with existing parsers (for the Erzya, Moksha, Udmurt, Komi, Kazakh, Tatar languages) or creating new parsers quickly and integrating them into LingvoDoc"
                      )}
                      ;
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                      {getTranslation(
                        "user-friendly interface for online manual word sense disambiguation which may arise after the text has been processed by the parser"
                      )}
                      ;
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                      {getTranslation(
                        "software for morphological analysis of glossed corpora, in particular, automatic identification of government models"
                      )}
                      .
                    </li>
                  </ul>
                </Accordion.Content>
                <Accordion.Title
                  className="lingvo-main-block__opportunities-list-title"
                  active={activeIndexes.indexOf(2) !== -1 ? true : false}
                  index={2}
                  onClick={handleClick}
                >
                  {getTranslation("User options for mapping linguistic features")} <i className="lingvo-icon-plus"></i>
                </Accordion.Title>
                <Accordion.Content
                  className="lingvo-main-block__opportunities-list-content"
                  active={activeIndexes.indexOf(2) !== -1 ? true : false}
                >
                  <ul className="lingvo-main-block__opportunities-full">
                    <li className="lingvo-main-block__opportunities-full-elem">
                      {getTranslation("creating search queries of any type of complexity and plotting them on the map")}
                      ;
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                      {getTranslation("mapping geographic areas")};
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                      {getTranslation(
                        "presenting results as online fragments of audio dictionaries and corpora which can be further edited or in the Excel file format"
                      )}
                      ;
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                      {getTranslation(
                        "an option to save the online map one has created as a link, and its automatic update when adding new materials to LingvoDoc"
                      )}
                      .
                    </li>
                  </ul>
                </Accordion.Content>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TopSectionSelector;
