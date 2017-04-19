import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { branch, renderComponent } from 'recompose';

import { Dropdown, Flag, Menu, Icon } from 'semantic-ui-react';

import { selectLocale } from 'ducks/locale';

const TITLE = 'Languages';

function checkCountry(shortcut) {
  return shortcut === 'en' ? 'gb' : shortcut;
}

function title({ intl_name: text }) {
  const extra = text ? `(${text})` : '';
  return TITLE + extra;
}

const WithSpinner = () =>
  <Menu.Item as="a">
    {TITLE} <Icon loading name="spinner" />
  </Menu.Item>;

const enhance = branch(
  ({ loading }) => loading,
  renderComponent(WithSpinner)
);

const Locale = enhance(({ locales, selected, select }) =>
  <Dropdown item text={title(selected)}>
    <Dropdown.Menu>
      {
        locales.map(locale =>
          <Dropdown.Item key={locale.id} active={locale === selected} onClick={() => select(locale)} >
            <Flag name={checkCountry(locale.shortcut)} />{locale.intl_name}
          </Dropdown.Item>
        )
      }
    </Dropdown.Menu>
  </Dropdown>
);

Locale.propTypes = {
  locales: PropTypes.array.isRequired,
  selected: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  select: PropTypes.func.isRequired,
};

export default connect(
  state => state.locale,
  { select: selectLocale }
)(Locale);
