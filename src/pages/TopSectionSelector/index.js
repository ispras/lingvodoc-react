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
                    <Link className="icon" to="/LanguagesDatabasesRoute">
                        <label className="label">{getTranslation('Languages databases')}</label>
                        <img className="img-tree img" src={imageCard}/>
                    </Link>
                    <Link className="icon" to="/toolsRoute">
                        <label className="label">{getTranslation('Tools')}</label>
                        <img className="img-tools img" src={imageCard}/>
                    </Link>
                    {(isAuthenticated) && (
                        <Link className="icon" to="/dashboardRoute">
                            <label className="label">{getTranslation('Dashboard')}</label>
                            <img className="img-dashboard img" src={imageCard}/>
                        </Link>)}

                    <Link className="icon" to="/grantsRoute">
                        <label className="label">{getTranslation('Grants')}</label>
                        <img className=" img" src={imageCard}/>
                    </Link>
                    <Link className="icon" to="/authors_route">
                        <label className="label">{getTranslation('Lingvodoc creators')}</label>
                        <img className=" img" src={imageCard}/>
                    </Link>
                    <Link className="icon" to="/supportRoute">
                        <label className="label">{getTranslation('Support')}</label>
                        <img className="img-support img" src={imageCard}/>
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
