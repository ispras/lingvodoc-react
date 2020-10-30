import React from 'react';
import './styles.scss';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { compose } from 'recompose';
import { getTranslation } from 'api/i18n';
import {Label} from 'semantic-ui-react'

const versionRoute = (props) => {
  const { data: { version } } = props;

  return (
    <div className='version-route'>
      <div className="version-block">
        <div className="version">
        <h1 className="help">{getTranslation('Version')}</h1>
          <span className="version" style={{ marginBottom: '0.5em' }}>Backend:</span>
          <span className="version" style={{ marginLeft: '0.5em' }}>{version}</span>
        </div>
        <div className="version">
          <span className="version" style={{ marginBottom: '0.5em' }}>Frontend:</span>
          <span className="version" style={{ marginLeft: '0.5em' }}>{__VERSION__}</span>
        </div>
      </div>
    </div>
  );
};

export default compose(graphql(gql`query version { version }`))(versionRoute);
