import React from 'react';
import PropTypes from 'prop-types';
import './styles.scss';
import imageLanguages from '../../images/book_lover.svg';
import imageTools from '../../images/noted.svg';
import imageDashboard from '../../images/responsive.svg';
import imageGrants from '../../images/winners.svg';
import imageCreators from '../../images/conference_call.svg';
import imageSupport from '../../images/connecting.svg';
import {Link} from 'react-router-dom';
import {getTranslation} from 'api/i18n';
import {compose} from 'recompose';
import {connect} from 'react-redux';
import Footer from 'components/Footer';

class topSectionSelector extends React.Component {

    render() {
        const {isAuthenticated} = this.props;
        return (
        <div class="lingvodoc-page">
            <div className="top-section-selector background-cards lingvodoc-page__content">
                <div className="top-section-selector_icon">
                    <Link className="card-item" to="/LanguagesDatabasesRoute">
                        <label className="card-item__label">{getTranslation('Languages databases')}</label>
                        <img className="card-item__img card-item__img_languages" src={imageLanguages} />
                    </Link>
                    <Link className="card-item" to="/toolsRoute">
                        <label className="card-item__label">{getTranslation('Tools')}</label>
                        <img className="card-item__img" src={imageTools} />
                    </Link>
                    {(isAuthenticated) && (
                        <Link className="card-item" to="/dashboardRoute">
                            <label className="card-item__label">{getTranslation('Dashboard')}</label>
                            <img className="card-item__img" src={imageDashboard} />
                        </Link>)}

                    <Link className="card-item" to="/grantsRoute">
                        <label className="card-item__label">{getTranslation('Grants')}</label>
                        <img className="card-item__img card-item__img_grants" src={imageGrants} />
                    </Link>
                    <Link className="card-item" to="/authors_route">
                        <label className="card-item__label">{getTranslation('Lingvodoc creators')}</label>
                        <img className="card-item__img card-item__img_creators" src={imageCreators} />
                    </Link>
                    <Link className="card-item" to="/supportRoute">
                        <label className="card-item__label">{getTranslation('Support')}</label>
                        <img className="card-item__img card-item__img_support" src={imageSupport} />
                    </Link>
                </div>
            </div>
            <Footer />
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
    connect(state => state.auth),
    connect(state => state.locale)
)(topSectionSelector);
