import React, { useContext } from "react";
import { Link } from "react-router-dom";

import Footer from "components/Footer";
import TranslationContext from "Layout/TranslationContext";

import imageDictionaries from "../../images/books1.svg";
import imageCreate from "../../images/books2.svg";
import imageDialeqt from "../../images/cloud_files.svg";
import imageImport from "../../images/cloud_files2.svg";
import imageCreateCorpus from "../../images/file_bundle1.svg";
import imageCorpora from "../../images/file_bundle2.svg";

import "./styles.scss";

function DashboardRoute() {
  const getTranslation = useContext(TranslationContext);

  return (
    <div className="lingvodoc-page">
      <div className="background-cards lingvodoc-page__content">
        <div className="dashboardRoute">
          <h2 className="dashboard-header">{getTranslation("Dashboard")}</h2>

          <div className="cards-list">
            <Link className="card-item" to="/dictionaries">
              <label className="card-item__label">{getTranslation("Dictionaries")}</label>
              <img className="card-item__img" src={imageDictionaries} />
            </Link>
            <Link className="card-item" to="/create_dictionary">
              <label className="card-item__label">{getTranslation("Create dictionary")}</label>
              <img className="card-item__img" src={imageCreate} />
            </Link>
            <Link className="card-item" to="/create_corpus">
              <label className="card-item__label">{getTranslation("Create corpus")}</label>
              <img className="card-item__img" src={imageCreateCorpus} />
            </Link>
            <Link className="card-item" to="/corpora">
              <label className="card-item__label">{getTranslation("Corpora")}</label>
              <img className="card-item__img" src={imageCorpora} />
            </Link>
            <Link className="card-item" to="/parallel_corpora">
              <label className="card-item__label">{getTranslation("Parallel corpora")}</label>
              <img className="card-item__img" src={imageCorpora} />
            </Link>
            <Link className="card-item" to="/import_corpora">
              <label className="card-item__label">{getTranslation("Import parallel corpora")}</label>
              <img className="card-item__img card-item__img_import" src={imageImport} />
            </Link>
            <Link className="card-item" to="/import_dialeqt">
              <label className="card-item__label">{getTranslation("Import Dialeqt dictionary")}</label>
              <img className="card-item__img card-item__img_dialeqt" src={imageDialeqt} />
            </Link>
            <Link className="card-item" to="/import_csv">
              <label className="card-item__label">{getTranslation("Import Excel and Starling dictionaries")}</label>
              <img className="card-item__img card-item__img_import" src={imageImport} />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default DashboardRoute;
