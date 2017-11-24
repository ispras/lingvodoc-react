import React from 'react';
import { pure } from 'recompose';
import { Modal, Button } from 'semantic-ui-react';

import LanguageSelect from 'components/Tree/LanguageSelect';

class Dictionary extends React.Component {
  constructor(props) {
    super(props);

    this.state = { open: false };
  }

  toggle = () => this.setState(state => ({ open: !state.open }))

  render() {
    const {
      blob,
      language,
      onSetLanguage,
    } = this.props;

    const triggerText = (language && language.get('translation', false)) || 'Select Language';
    const trigger = <Button onClick={this.toggle}>{triggerText}</Button>;

    return (
      <div className="blob">
        <b className="blob-name">{blob.get('name')}</b>
        <div className="blob-columns">
          <Modal
            dimmer="blurring"
            open={this.state.open}
            onClose={this.toggle}
            trigger={trigger}
          >
            <Modal.Header>Select Language for {blob.get('name')}</Modal.Header>
            <Modal.Content>
              <LanguageSelect
                onSelect={(params) => {
                  onSetLanguage(params);
                  this.toggle();
                }}
              />
            </Modal.Content>
          </Modal>
        </div>
      </div>
    );
  }
}

function LanguageSelection({ state, languages, onSetLanguage }) {

  return (
    <div className="language-selection">
      {
        state.map((v, id) =>
          <Dictionary
            key={id.join('/')}
            blob={v}
            language={languages.get(id)}
            onSetLanguage={onSetLanguage(id)}
          />).toArray()
      }
    </div>
  );
}

export default pure(LanguageSelection);
