import React from 'react';
import './styles.scss';
import imageCard from '../../images/cat.svg';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';

function toolsRoute(props) {
  return (
  <div class="lingvodoc-page">
    <div className="background-cards lingvodoc-page__content">
      <div className="toolsRoute">
        <h2 class="tools-header">{getTranslation('Tools')}</h2>

        <div class="cards-list">
          <Link className="card-item" to="/map">
            <label className="card-item__label">{getTranslation('Maps')}</label>
            <img className="card-item__img" src={imageCard} />
          </Link>
          <Link className="card-item" to="/map_search">
            <label className="card-item__label">{getTranslation('Search')}</label>
            <img className="card-item__img" src={imageCard} />
          </Link>
          <a className="card-item" target="_blank" href="https://github.com/ispras/lingvodoc-react/wiki/%D0%A5%D1%80%D0%B0%D0%BD%D0%B8%D0%BB%D0%B8%D1%89%D0%B5-%D0%BA%D0%B0%D1%80%D1%82">
            <label className="card-item__label">{getTranslation('Storage')}</label>
            <img className="card-item__img" src={imageCard} />
          </a>
          {props.user && props.user.id == 1 && (
            <Link className="card-item" to="/distance_map">
              <label className="card-item__label">{getTranslation('Distance map')}</label>
              <img className="card-item__img" src={imageCard} />
            </Link>
          )}
          <Link className="card-item" to="/languages">
            <label className="card-item__label">{getTranslation('Languages')}</label>
            <img className="card-item__img" src={imageCard} />
          </Link>
        </div>
      </div>
    </div>
    <div class="lingvodoc-page__footer lingvodoc-footer">
        Copyright © 2012-2021 Institute of Linguistics Russian Academy of Sciences, Ivannikov Institute for System Programming of the Russian Academy of Sciences, Tomsk State University
    </div>
  </div>
  );
}

export default connect(state => state.user)(toolsRoute);
