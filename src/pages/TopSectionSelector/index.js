import React from 'react';
import PropTypes from 'prop-types';
import './styles.scss';
import imgTree from '../../images/tree.jpg';
import imgTools from '../../images/tools.jpg';
import imgDashboard from '../../images/dashboard.png';
import imgAuthors from '../../images/organization.jpg';
import imgSupport from '../../images/support.jpg';
import imageScholarship from '../../images/scholarship.png';
import { Link } from 'react-router-dom';
import { getTranslation } from 'api/i18n';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';
import { bindActionCreators } from 'redux';
import { setIsAuthenticated } from 'ducks/auth';

class topSectionSelector extends React.Component {
  constructor(props) {
    super(props);
    this.queryIsAuthenticated = this.queryIsAuthenticated.bind(this);
  }
  componentDidMount() {
    this.queryIsAuthenticated();
  }
  componentWillReceiveProps() {
    this.queryIsAuthenticated();
  }

  queryIsAuthenticated = async () => {
    const {
      isAuthenticated, client, actions, loading
    } = this.props;

    if (!loading) {
      const resultQuery = await client.query({
        query: gql`
    query isAuthenticatedProxy {
         is_authenticated
        }`

      });
      if (!resultQuery.loading) {
        if (isAuthenticated || resultQuery.data.is_authenticated) {
          actions.setIsAuthenticated({ isAuthenticated: resultQuery.data.is_authenticated });
        }
      }
    }
  };

  render() {
    const { isAuthenticated } = this.props;
    return (
      <div className="top-section-selector">
        <div className="top-section-selector_icon">
          <div className="icon">
            <label className="label">{getTranslation('Languages databases')}</label>
            <Link to="/LanguagesDatabasesRoute">
              <img className="img-tree img" src={imgTree} />
            </Link>
          </div>
          <div className="icon">
            <label className="label">{getTranslation('Tools')}</label>
            <Link to="/toolsRoute">
              <img className="img-tools img" src={imgTools} />
            </Link>
          </div>
          {(isAuthenticated) && (
            <div className="icon">
              <label className="label">{getTranslation('Dashboard')}</label>
              <Link to="/dashboardRoute">
                <img className="img-dashboard img" src={imgDashboard} />
              </Link>
            </div>)}

          <div className="icon">
            <label className="label">{getTranslation('Grants')}</label>
            <Link to="/grantsRoute">
              <img className=" img" src={imageScholarship} />
            </Link>
          </div>
          <div className="icon">
            <label className="label">{getTranslation('Lingvodoc creators')}</label>
            <Link to="/authors_route">
              <img className=" img" src={imgAuthors} />
            </Link>
          </div>
          <div className="icon">
            <label className="label">{getTranslation('Support')}</label>
            <Link to="/supportRoute">
              <img className="img-support img" src={imgSupport} />
            </Link>
          </div>
        </div>
      </div>


    );
  }
}


topSectionSelector.propTypes = {
  isAuthenticated: PropTypes.bool
};

topSectionSelector.defaultProps = {
  isAuthenticated: false
};

export default compose(
  connect(
    state => state.auth,
    dispatch => ({
      actions: bindActionCreators({
        setIsAuthenticated
      }, dispatch)
    })
  ),
  connect(state => state.locale),
  withApollo
)(topSectionSelector);

