import React, { useContext } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { bindActionCreators } from "redux";
import { Button } from "semantic-ui-react";
import Footer from "components/Footer";
import TranslationContext from "Layout/TranslationContext";

import imageLanguages from "../../images/around_world.svg";
import imageStorage from "../../images/collecting.svg";
import imageMap from "../../images/connected_world.svg";
import imageDistanceMap from "../../images/distance_map.svg";
import imageSearch from "../../images/location_search.svg";
import imageTranslations from "../../images/text_field.svg";
import imageValency from "../../images/verb_valency.svg";

import { openModal as cognateAnalysisOpenModal } from "ducks/cognateAnalysis";

import "./styles.scss";

function ToolsRoute({ user, actions }) {
  const getTranslation = useContext(TranslationContext);

  return (
    <div className="lingvodoc-page">
      <div className="background-cards lingvodoc-page__content">
        <div className="toolsRoute">
          <h2 className="tools-header">{getTranslation("Tools")}</h2>

          <div className="cards-list">
            <Link className="card-item" to="/map">
              <label className="card-item__label">{getTranslation("Map of the languages and dialects")}</label>
              <img className="card-item__img card-item__img_map" src={imageMap} />
            </Link>
            <Link className="card-item" to="/map_search">
              <label className="card-item__label">{getTranslation("Search and map’s creating")}</label>
              <img className="card-item__img card-item__img_search" src={imageSearch} />
            </Link>
            <a
              className="card-item"
              target="_blank"
              href="https://github.com/ispras/lingvodoc-react/wiki/%D0%A5%D1%80%D0%B0%D0%BD%D0%B8%D0%BB%D0%B8%D1%89%D0%B5-%D0%BA%D0%B0%D1%80%D1%82"
              rel="noreferrer"
            >
              <label className="card-item__label">{getTranslation("Library of linguistic maps")}</label>
              <img className="card-item__img" src={imageStorage} />
            </a>
            {user && user.id && (
              <Link className="card-item" to="/distance_map">
                <label className="card-item__label">{getTranslation("Language genetic proximity map")}</label>
                <img className="card-item__img card-item__img_distance-map" src={imageDistanceMap} />
              </Link>
            )}
            <Link className="card-item" to="/languages">
              <label className="card-item__label">{getTranslation("Edit of the dialects classification")}</label>
              <img className="card-item__img" src={imageLanguages} />
            </Link>
            {user && user.id == 1 && (
              <Link className="card-item" to="/edit_translations">
                <label className="card-item__label">{getTranslation("Edit translations")}</label>
                <img className="card-item__img" src={imageTranslations} />
              </Link>
            )}
            {user.id !== undefined && (
              <Link className="card-item" to="/valency">
                <label className="card-item__label">{getTranslation("Verb valency")}</label>
                <img className="card-item__img card-item__img_verb-valency" src={imageValency} />
              </Link>
            )}
            {user.id !== undefined && (
              <Link className="card-item" to="/adverb">
                <label className="card-item__label">{getTranslation("Adverb specificity")}</label>
                <img className="card-item__img card-item__img_verb-valency" src={imageValency} />
              </Link>
            )}
            {user.id !== undefined && (
              <Link className="card-item" to="/list_cognates">
                <label className="card-item__label">{getTranslation("Cognates summary")}</label>
                <img className="card-item__img" src={imageStorage} />
              </Link>
            )}
            {user.id !== undefined && (
              <Link className="card-item"
                to="/tools"
                onClick={() => actions.cognateAnalysisOpenModal(null, "complex_distance")}
              >
                <label className="card-item__label">{getTranslation("Get composite distance between languages")}</label>
                <img className="card-item__img card-item__img_map" src={imageMap} />
              </Link>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default connect(
  state => state.user,
  dispatch => ({
    actions: bindActionCreators({
      cognateAnalysisOpenModal,
    },
    dispatch)
  })
)(
ToolsRoute);
