import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

/* ----------- PROPS ----------- */
const classNames = {
  container: 'search-language-tree__item',
  translationWrap: 'search-language-tree__translation-wrap',
  translation: 'search-language-tree__translation',
  checkbox: 'search-language-tree__checkbox',
};

/* ----------- COMPONENT ----------- */
class DictionaryItem extends PureComponent {
  constructor(props) {
    super();

    const { data } = props;

    if (data && (data.checked === undefined || data.checked)) {
      this.state = {
        checked: true,
      };
    } else {
      this.state = {
        checked: false,
      };
    }

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
  }

  onCheckboxChange(ev) {
    this.props.onChange(this.props.data.id, 'dictionary', ev.target.checked);

    this.setState({
      checked: ev.target.checked,
    });
  }

  render() {
    const { data } = this.props;

    return (
      <div className={classNames.container}>
        <div className={classNames.translationWrap}>
          <input
            className={classNames.checkbox}
            type="checkbox"
            checked={this.state.checked}
            onChange={this.onCheckboxChange}
          />
          <div className={classNames.translation}>
            <strong>{data.translation}</strong>
          </div>
        </div>
      </div>
    );
  }
}

/* ----------- PROPS VALIDATION ----------- */
DictionaryItem.propTypes = {
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default DictionaryItem;
