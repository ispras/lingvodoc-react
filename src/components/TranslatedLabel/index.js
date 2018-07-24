import React from 'react';
import PropTypes from 'prop-types';
import { compose, pure } from 'recompose';
import { connect } from 'react-redux';

const TranslatedLabel = ({ children, locale, translations }) => {
  if (typeof children === 'string') {
    const gist = translations.find(g => !!g.translationatoms.find(atom => atom.locale_id === 2 && atom.content === children));

    if (gist) {
      const atom = gist.translationatoms.find(a => a.locale_id === locale.id);
      if (atom) {
        return atom.content;
      }
    }
  }
  // not found or invalid content, return as is
  return children;
};

TranslatedLabel.propTypes = {
  translations: PropTypes.arrayOf(PropTypes.object).isRequired,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  locale: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({ translations: state.translations, locale: state.locale.selected });

export default compose(
  pure,
  connect(mapStateToProps)
)(TranslatedLabel);
