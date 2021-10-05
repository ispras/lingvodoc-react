import React from 'react';
import './styles.scss';
import Info from '../Info';
import { getTranslation } from 'api/i18n';

function authorsRoute() {
  return (
    <div className="authorsRoute">
      <div className="background-header">
        <h2 className="page-title">{getTranslation('Lingvodoc creators')}</h2>
      </div>
      <Info />
    </div>
  );
}


export default authorsRoute;

