/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'semantic-ui-react';
import './styles.scss';
import imgTree from '../../images/tree.jpg';
import imgTools from '../../images/tools.jpg';
import imgDashboard from '../../images/dashboard.png';
import imgOrganization from '../../images/organization.jpg';
import imgSupport from '../../images/support.jpg';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import { getTranslation } from 'api/i18n';
import gql from 'graphql-tag';
import { compose } from 'recompose';
import News from '../../components/News';

const IsAuthenticated = gql`
  query isAuthenticated {
    is_authenticated
  }
`;

const TopSectionSelector = (props) => {
  const { data: { is_authenticated: isAuthenticated } } = props;
  return (
    <div className="topSectionSelector">

      <Label className="label">{getTranslation('Tree')}</Label>
      <Link to="/treeRoute">
        <img className="img-tree img" src={imgTree} alt="tree" />
      </Link>
      <Label className="label">{getTranslation('Tools')}</Label>
      <Link to="/toolsRoute">
        <img className="img-tools img" src={imgTools} alt="tools" />
      </Link>
      {isAuthenticated ? <Label className="label">{getTranslation('Dashboard')}</Label> : null}
      {isAuthenticated ?
        <Link to="/dashboardRoute">
          <img className="img-dashboard img" src={imgDashboard} alt="dashboard" />
        </Link> : null}
      <Label className="label">{getTranslation('Organization')}</Label>
      <Link to="/organizationRoute">
        <img className="img-organization img" src={imgOrganization} alt="organization" />
      </Link>
      <Label className="label">{getTranslation('Support')}</Label>
      <Link to="/supportRoute">
        <img className="img-support img" src={imgSupport} alt="support" />
      </Link>
      <News />

    </div>


  );
};
TopSectionSelector.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
};
export default compose(graphql(IsAuthenticated)(TopSectionSelector));
