import React, { version } from 'react';
import './styles.scss';
import imageQuestion from '../../images/question.png';
import imageComputer from '../../images/computer.png';
import { Link } from 'react-router-dom';
import { List } from 'semantic-ui-react';
import { getTranslation } from 'api/i18n';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { compose } from 'recompose';


const supportRoute = (props) => {
  const { data: { version } } = props;

  return (
    <div>
      <div className="supportRoute">
        <div className="background-img" />
        <p className="help">{getTranslation('Support')}</p>
        <div className="img-block">
          <a href="https://github.com/ispras/lingvodoc-react/wiki" target="_blank"> <img className="img " src={imageQuestion} /></a>
          <p>{getTranslation('Help')}</p>
        </div>
        <div className="img-block" >
          <Link to="/desktop"><img className="img " src={imageComputer} /></Link>
          <p> {getTranslation('Desktop')}</p>
        </div>
        <List className="version-block">
          <List.Item className="version">
            <span className="version" style={{ marginBottom: '0.5em' }}>Backend:</span>
            <span className="version" style={{ marginLeft: '0.5em' }}>{version}</span>
          </List.Item>
          <List.Item className="version">
            <span className="version" style={{ marginBottom: '0.5em' }}>Frontend:</span>
            <span className="version" style={{ marginLeft: '0.5em' }}>{__VERSION__}</span>
          </List.Item>
        </List>
      </div>
    </div>
  );
};

export default compose(graphql(gql`query version { version }`))(supportRoute);
