import React from 'react';
import './styles.scss';
import Info from '../Info';
import { getTranslation } from 'api/i18n';

function authorsRoute() {
  return (
    <div>
      <div className="authorsRoute">
        <div className="background-header">
          <h2 className="page-title">{getTranslation('Lingvodoc creators')}</h2>
        </div>
        <Info />
      </div>
    </div>
  );
}


export default authorsRoute;

