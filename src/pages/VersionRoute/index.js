import React from 'react';
import './styles.scss';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { compose } from 'recompose';
import { getTranslation } from 'api/i18n';
import {Label} from 'semantic-ui-react';
import { map } from 'lodash';

const versionRoute = (props) => {

  const {
    data: {
      version,
      version_uniparser } } = props;

  let uniparser_str_list = null;

  if (version_uniparser)
  {
    uniparser_str_list = Object.keys(version_uniparser);
    uniparser_str_list.sort();
  }

  return (
    <div className="version-route">
      <div className="version-block">

        <div className="version">
          <h1 className="help">{getTranslation('Version')}</h1>
          <span className="version" style={{ marginBottom: '0.5em' }}>Backend:</span>
          <span className="version" style={{ marginLeft: '0.5em' }}>{version}</span>
        </div>

        {version_uniparser &&
          map(uniparser_str_list, uniparser_str => (
            <div className="version">
              <span className="version" style={{ marginBottom: '0.5em' }}>{uniparser_str}:</span>
              <span className="version" style={{ marginLeft: '0.5em' }}>{version_uniparser[uniparser_str]}</span>
            </div>))}

        <div className="version">
          <span className="version" style={{ marginBottom: '0.5em' }}>Frontend:</span>
          <span className="version" style={{ marginLeft: '0.5em' }}>{__VERSION__}</span>
        </div>

      </div>
    </div>
  );
};

export default compose(graphql(gql`query version { version version_uniparser }`))(versionRoute);
