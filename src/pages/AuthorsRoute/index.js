import React from 'react';
import './styles.scss';
import Info from '../Info';
import { getTranslation } from 'api/i18n';

function authorsRoute() {
  return (
    <div>
      <div className="authorsRoute">
        <p className="authors">{getTranslation('Lingvodoc creators')}</p>
        <Info />
      </div>
    </div>
  );
}


export default authorsRoute;

