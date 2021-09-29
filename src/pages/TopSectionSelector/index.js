import React from 'react';
import PropTypes from 'prop-types';
import './styles.scss';
import imageCard from '../../images/cat.svg';
import {Link} from 'react-router-dom';
import {getTranslation} from 'api/i18n';
import {compose} from 'recompose';
import {connect} from 'react-redux';

class topSectionSelector extends React.Component {

    render() {
        const {isAuthenticated} = this.props;
        return (
            <div className="top-section-selector">
                <div className="top-section-selector_icon">
                    <Link className="card" to="/LanguagesDatabasesRoute">
                        <label className="card__label">{getTranslation('Languages databases')}</label>
                        <img className="card__img" src={imageCard}/>
                    </Link>
                    <Link className="card" to="/toolsRoute">
                        <label className="card__label">{getTranslation('Tools')}</label>
                        <img className="card__img" src={imageCard}/>
                    </Link>
                    {(isAuthenticated) && (
                        <Link className="card" to="/dashboardRoute">
                            <label className="card__label">{getTranslation('Dashboard')}</label>
                            <img className="card__img" src={imageCard}/>
                        </Link>)}

                    <Link className="card" to="/grantsRoute">
                        <label className="card__label">{getTranslation('Grants')}</label>
                        <img className="card__img" src={imageCard}/>
                    </Link>
                    <Link className="card" to="/authors_route">
                        <label className="card__label">{getTranslation('Lingvodoc creators')}</label>
                        <img className="card__img" src={imageCard}/>
                    </Link>
                    <Link className="card" to="/supportRoute">
                        <label className="card__label">{getTranslation('Support')}</label>
                        <img className="card__img" src={imageCard}/>
                    </Link>
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
    connect(state => state.auth),
    connect(state => state.locale)
)(topSectionSelector);
