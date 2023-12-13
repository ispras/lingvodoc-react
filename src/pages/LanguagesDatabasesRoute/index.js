import React from "react";
import { Link } from "react-router-dom";

import Footer from "components/Footer";
import { useTranslations } from "hooks";

import imageDictionares from "../../images/bookshelves.svg";
import imageCorpora from "../../images/file_bundle.svg";
import imageParallelCorpora from "../../images/file_bundle3.svg";

import "./styles.scss";

function TreeRoute() {
  const { getTranslation } = useTranslations();

  return (
    <div className="lingvodoc-page">
      <div className="background-cards lingvodoc-page__content">
        <div className="treeRoute">
          <h2 className="tree-header">{getTranslation("Languages databases")}</h2>

          <div className="cards-list">
            <Link className="card-item" to="/dictionaries_all">
              <label className="card-item__label">{getTranslation("Dictionaries")}</label>
              <img className="card-item__img" src={imageDictionares} />
            </Link>
            <Link className="card-item" to="/corpora_all">
              <label className="card-item__label">{getTranslation("Language corpora")}</label>
              <img className="card-item__img card-item__img_corpora" src={imageCorpora} />
            </Link>
            <Link className="card-item" to="/parallel_corpora_all">
              <label className="card-item__label">{getTranslation("Parallel corpora")}</label>
              <img className="card-item__img card-item__img_parallel-corpora" src={imageParallelCorpora} />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default TreeRoute;
