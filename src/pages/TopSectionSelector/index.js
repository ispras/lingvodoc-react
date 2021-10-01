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
        <div class="lingvodoc-page">
            <div className="top-section-selector background-cards lingvodoc-page__content">
                <div className="top-section-selector_icon">
                    <Link className="card-item" to="/LanguagesDatabasesRoute">
                        <label className="card-item__label">{getTranslation('Languages databases')}</label>
                        <img className="card-item__img" src={imageCard}/>
                    </Link>
                    <Link className="card-item" to="/toolsRoute">
                        <label className="card-item__label">{getTranslation('Tools')}</label>
                        <img className="card-item__img" src={imageCard}/>
                    </Link>
                    {(isAuthenticated) && (
                        <Link className="card-item" to="/dashboardRoute">
                            <label className="card-item__label">{getTranslation('Dashboard')}</label>
                            <img className="card-item__img" src={imageCard}/>
                        </Link>)}

                    <Link className="card-item" to="/grantsRoute">
                        <label className="card-item__label">{getTranslation('Grants')}</label>
                        <img className="card-item__img" src={imageCard}/>
                    </Link>
                    <Link className="card-item" to="/authors_route">
                        <label className="card-item__label">{getTranslation('Lingvodoc creators')}</label>
                        <img className="card-item__img" src={imageCard}/>
                    </Link>
                    <Link className="card-item" to="/supportRoute">
                        <label className="card-item__label">{getTranslation('Support')}</label>
                        <img className="card-item__img" src={imageCard}/>
                    </Link>
                </div>
            </div>
            <div class="lingvodoc-page__footer lingvodoc-footer">
                Copyright © 2012-2021 Institute of Linguistics Russian Academy of Sciences, Ivannikov Institute for System Programming of the Russian Academy of Sciences, Tomsk State University
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
