import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';

import { Dropdown, Flag } from 'semantic-ui-react';

import { selectLang } from 'Ducks/language';

const User = ({ langs, selected, selectLang }) =>
  <Dropdown item text={`Languages(${langs[selected]})`}>
    <Dropdown.Menu>
      {
        map(langs, (text, code) =>
          <Dropdown.Item key={code} active={code === selected} onClick={() => selectLang(code)} >
            <Flag name={code} />{text}
          </Dropdown.Item>
        )
      }
    </Dropdown.Menu>
  </Dropdown>;

User.propTypes = {
  langs: PropTypes.shape().isRequired,
  selected: PropTypes.string.isRequired,
  selectLang: PropTypes.func.isRequired,
};

export default connect(
  state => state.language,
  { selectLang }
)(User);
