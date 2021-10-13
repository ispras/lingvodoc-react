import React from 'react';
import { pure } from 'recompose';
import { Form, Input, Modal, Button } from 'semantic-ui-react';

import Languages from 'components/Languages';
import { getTranslation } from 'api/i18n';

import { license_options } from 'components/EditDictionaryMetadata';

class Dictionary extends React.Component {
  constructor(props) {
    super(props);

    this.state = { open: false };
  }

  toggle = () => this.setState(state => ({ open: !state.open }));

  render() {
    const {
      blob, language, license, locales, onSetLanguage, onSetTranslation, onSetLicense
    } = this.props;

    const triggerText = (language && language.get('translation', false)) || getTranslation('Select Parent Language');
    const trigger = <Button onClick={this.toggle}>{triggerText}</Button>;

    return (
      <div className="blob">
        <b className="blob-name">{blob.get('name')}</b>
        <div className="blob-lang">

          <Modal
            dimmer="blurring"
            open={this.state.open}
            closeIcon
            onClose={this.toggle}
            trigger={trigger}
            className="lingvo-modal2">

            <Modal.Header>{getTranslation('Select Language for')} {blob.get('name')}</Modal.Header>
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
                  <label>{getTranslation('Translation for')} {locale.intl_name}</label>
                  <Input
                    value={blob.getIn(['translation', locale.id], '')}
                    onChange={(e, data) => onSetTranslation(locale.id, data.value)}
                  />
                </Form.Field>
              ))}
            </Form.Group>

            <Form.Group widths="equal">
              <Form.Dropdown
                fluid
                label={getTranslation('License')}
                selection
                search
                options={license_options}
                defaultValue={license || 'proprietary'}
                onChange={(event, data) => onSetLicense(data.value)}
              />
            </Form.Group>
          </Form>
        </div>
      </div>
    );
  }
}

function LanguageSelection({
  state, languages, licenses, locales, onSetLanguage, onSetTranslation, onSetLicense,
}) {

  return (
    <div className="language-selection">
      {state
        .map((v, id) => (
          <Dictionary
            key={id.join('/')}
            blob={v}
            language={languages.get(id)}
            license={licenses.get(id)}
            onSetLanguage={onSetLanguage(id)}
            onSetTranslation={onSetTranslation(id)}
            onSetLicense={onSetLicense(id)}
            locales={locales}
          />
        ))
        .toArray()}
    </div>
  );
}

export default pure(LanguageSelection);
