import React from 'react';
import { pure } from 'recompose';
import { Form, Input, Modal, Button } from 'semantic-ui-react';

import LanguageSelect from 'components/Tree/LanguageSelect';
import Languages from 'components/Languages';

class Dictionary extends React.Component {
  constructor(props) {
    super(props);

    this.state = { open: false };
  }

  toggle = () => this.setState(state => ({ open: !state.open }));

  render() {
    const {
      blob, language, locales, onSetLanguage, onSetTranslation,
    } = this.props;

    const triggerText = (language && language.get('translation', false)) || 'Select Parent Language';
    const trigger = <Button onClick={this.toggle}>{triggerText}</Button>;

    return (
      <div className="blob">
        <b className="blob-name">{blob.get('name')}</b>
        <div className="blob-lang">
          <Modal dimmer="blurring" open={this.state.open} onClose={this.toggle} trigger={trigger}>
            <Modal.Header>Select Language for {blob.get('name')}</Modal.Header>
            <Modal.Content style={{ minHeight: '500px' }}>
              <div style={{ height: '500px' }}>
                <Languages
                  onSelect={(params) => {
                    onSetLanguage(params);
                    this.toggle();
                  }}
                />
              </div>
            </Modal.Content>
          </Modal>

          <Form>
            <Form.Group widths="equal">
              {locales.map(locale => (
                <Form.Field key={locale.id}>
                  <label>Translation for {locale.intl_name}</label>
                  <Input
                    value={blob.getIn(['translation', locale.id], '')}
                    onChange={(e, data) => onSetTranslation(locale.id, data.value)}
                  />
                </Form.Field>
              ))}
            </Form.Group>
          </Form>
        </div>
      </div>
    );
  }
}

function LanguageSelection({
  state, languages, locales, onSetLanguage, onSetTranslation,
}) {
  return (
    <div className="language-selection">
      {state
        .map((v, id) => (
          <Dictionary
            key={id.join('/')}
            blob={v}
            language={languages.get(id)}
            onSetLanguage={onSetLanguage(id)}
            onSetTranslation={onSetTranslation(id)}
            locales={locales}
          />
        ))
        .toArray()}
    </div>
  );
}

export default pure(LanguageSelection);
