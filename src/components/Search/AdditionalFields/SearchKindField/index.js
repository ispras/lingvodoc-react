import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Form, Radio } from 'semantic-ui-react';

/* ----------- COMPONENT ----------- */
/**
 * Kind field.
 */
class SearchKindField extends PureComponent {
  static propTypes = {
    value: PropTypes.oneOf([
      'Expedition', 'Archive', null,
    ]),
    onChange: PropTypes.func.isRequired,
    classNames: PropTypes.object.isRequired,
  }

  constructor() {
    super();

    this.onChange = this.onChange.bind(this);
  }

  /**
   * On value change event handler.
   * @param {boolean|null} value - field value
   */
  onChange(ev, { value }) {
    const { onChange } = this.props;
    onChange(value);
  }

  render() {
    const { value, classNames } = this.props;

    return (
      <div className={classNames.field}>
        <div className={classNames.header}>Источник данных</div>
        <Form>
          <Form.Field>
            <Radio
              label="Expedition"
              name="kind"
              value="Expedition"
              checked={value === 'Expedition'}
              onChange={this.onChange}
            />
          </Form.Field>
          <Form.Field>
            <Radio
              label="Archive"
              name="kind"
              value="Archive"
              checked={value === 'Archive'}
              onChange={this.onChange}
            />
          </Form.Field>
        </Form>
      </div>
    );
  }
}

export default SearchKindField;
