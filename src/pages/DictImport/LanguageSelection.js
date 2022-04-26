import React from "react";
import { Button, Form, Input, Modal } from "semantic-ui-react";
import { pure } from "recompose";

import { license_options } from "components/EditDictionaryMetadata";
import Languages from "components/Languages";
import TranslationContext from "Layout/TranslationContext";

class Dictionary extends React.Component {
  constructor(props) {
    super(props);

    this.state = { open: false };
  }

  toggle = () => this.setState(state => ({ open: !state.open }));

  render() {
    const { blob, language, license, locales, onSetLanguage, onSetTranslation, onSetLicense } = this.props;

    const translations = language && language.get("translations", null);
    const triggerText = translations ? T(translations.toJS()) : this.context("Select Parent Language");
    const trigger = <Button onClick={this.toggle}>{triggerText}</Button>;

    return (
      <div className="blob">
        <b className="blob-name">{blob.get("name")}</b>
        <div className="blob-lang">
          <Modal
            dimmer="blurring"
            open={this.state.open}
            closeIcon
            onClose={this.toggle}
            trigger={trigger}
            className="lingvo-modal2"
          >
            <Modal.Header>
              {this.context("Select Language for")} {blob.get("name")}
            </Modal.Header>
            <Modal.Content style={{ minHeight: "500px" }}>
              <div style={{ height: "500px" }}>
                <Languages
                  onSelect={params => {
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
                  <label>
                    {this.context("Translation for")} {locale.intl_name}
                  </label>
                  <Input
                    value={blob.getIn(["translation", locale.id], "")}
                    onChange={(e, data) => onSetTranslation(locale.id, data.value)}
                  />
                </Form.Field>
              ))}
            </Form.Group>

            <Form.Group widths="equal">
              <Form.Dropdown
                fluid
                label={this.context("License")}
                selection
                search
                options={license_options(this.context)}
                defaultValue={license || "proprietary"}
                onChange={(event, data) => onSetLicense(data.value)}
              />
            </Form.Group>
          </Form>
        </div>
      </div>
    );
  }
}

Dictionary.contextType = TranslationContext;

function LanguageSelection({ state, languages, licenses, locales, onSetLanguage, onSetTranslation, onSetLicense }) {
  return (
    <div className="language-selection">
      {state
        .map((v, id) => (
          <Dictionary
            key={id.join("/")}
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
