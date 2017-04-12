import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { branch, renderComponent } from 'recompose';

import { Dropdown, Flag, Menu, Icon } from 'semantic-ui-react';

import { selectLang } from 'ducks/language';

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
  ({ langs }) => !(langs && langs.length > 0),
  renderComponent(WithSpinner)
);

const Language = enhance(({ langs, selected, select }) =>
  <Dropdown item text={title(selected)}>
    <Dropdown.Menu>
      {
        langs.map(lang =>
          <Dropdown.Item key={lang.id} active={lang === selected} onClick={() => select(lang)} >
            <Flag name={checkCountry(lang.shortcut)} />{lang.intl_name}
          </Dropdown.Item>
        )
      }
    </Dropdown.Menu>
  </Dropdown>
);

Language.propTypes = {
  langs: PropTypes.array.isRequired,
  selected: PropTypes.object.isRequired,
  select: PropTypes.func.isRequired,
};

export default connect(
  state => state.language,
  { select: selectLang }
)(Language);
