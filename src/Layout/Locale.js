import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { pure, branch, renderComponent, compose } from 'recompose';

import { Dropdown, Flag, Menu, Icon } from 'semantic-ui-react';

import { changeLocale } from 'ducks/locale';

function checkCountry(shortcut) {
  return shortcut === 'en' ? 'gb' : shortcut;
}

function icon({ shortcut }) {
  return <React.Fragment>
    <Flag name={checkCountry(shortcut)} />
    <Icon name="caret down" />
  </React.Fragment>;
}

function title({ intl_name: text }) {
  const extra = text ? ` ${text.slice(0, 3)}` : '';
  return extra;
}

const WithSpinner = () =>
  <Menu.Item as="a" className="top_menu">
    <span><Icon loading name="spinner"/></span>
  </Menu.Item>;

const enhance = compose(
  pure,
  branch(
    ({ loading }) => loading,
    renderComponent(WithSpinner)
  )
);

const Locale = enhance(({ locales, selected, select }) =>
  <Dropdown item text={title(selected)} icon={icon(selected)} className="top_menu top_menu__item_locale">
    <Dropdown.Menu>
      {
        locales.map(loc =>
          <Dropdown.Item
            key={loc.id}
            active={loc === selected}
            onClick={() => loc !== selected && select(loc)}
          >
            <Flag name={checkCountry(loc.shortcut)} />{loc.intl_name}
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
  { select: changeLocale }
)(Locale);
