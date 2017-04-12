import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { branch, renderComponent } from 'recompose';

import { Dropdown, Flag, Menu, Icon } from 'semantic-ui-react';

import { selectLang } from 'ducks/language';

const WithSpinner = () =>
  <Menu.Item as="a">
    Languages <Icon loading name="spinner" />
  </Menu.Item>;

const enhance = branch(
  ({ langs }) => !(langs && langs.length > 0),
  renderComponent(WithSpinner)
);

const Language = enhance(({ langs, selected, select }) =>
  <Dropdown item text="Languages">
    <Dropdown.Menu>
      {
        langs.map(({ id, shortcut, intl_name: text }) =>
          <Dropdown.Item key={id} active={id === selected} onClick={() => select(id)} >
            <Flag name={shortcut === 'en' ? 'gb' : shortcut} />{text}
          </Dropdown.Item>
        )
      }
    </Dropdown.Menu>
  </Dropdown>
);

Language.propTypes = {
  langs: PropTypes.array.isRequired,
  selected: PropTypes.number.isRequired,
  select: PropTypes.func.isRequired,
};

export default connect(
  state => state.language,
  { select: selectLang }
)(Language);
