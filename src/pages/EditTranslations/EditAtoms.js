import React from "react";
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Dropdown, Popup } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { withApollo } from "@apollo/client/react/hoc";

import locale from "api/locale";
import TranslationContext from "Layout/TranslationContext";

const createTranslationsMutation = gql`
  mutation ($type: String!) {
    create_translationgist(type: $type) {
      translationgist {
        id
        type
      }
      triumph
    }
  }
`;

const createAtomMutation = gql`
  mutation ($parent_id: LingvodocID!, $locale_id: Int!, $content: String!) {
    create_translationatom(parent_id: $parent_id, locale_id: $locale_id, content: $content) {
      translationatom {
        id
        locale_id
        content
      }
      triumph
    }
  }
`;

const updateAtomMutation = gql`
  mutation updateAtom($id: LingvodocID!, $locale_id: Int!, $content: String!) {
    update_translationatom(id: $id, locale_id: $locale_id, content: $content) {
      translationatom {
        id
        locale_id
        content
      }
      triumph
    }
  }
`;

const deleteAtomMutation = gql`
  mutation deleteAtom($id: LingvodocID!) {
    delete_translationatom(id: $id) {
      triumph
    }
  }
`;

class EditAtoms extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      atoms: props.atoms,
      newGist: props.newGist,
      gistId: props.gistId
    };

    this.initialState = {
      atoms: props.newGist ? [] : props.atoms
    };

    this.languageOptions = props.locales.map(locale => {
      return { key: locale.id, value: locale.id, text: locale.intl_name };
    });

    this.onContentChange = this.onContentChange.bind(this);
    this.onLanguageChange = this.onLanguageChange.bind(this);
    this.onDeleteAtom = this.onDeleteAtom.bind(this);
    this.onAddTranslation = this.onAddTranslation.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onFocusTextArea = this.onFocusTextArea.bind(this);
    this.onBlurTextArea = this.onBlurTextArea.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state === nextState) {
      return false;
    }
    return true;
  }

  createTranslationGist() {
    return {
      mutation: createTranslationsMutation,
      variables: {
        type: this.props.gistsType
      }
    };
  }

  getAvailableLanguagesOptions(atom) {
    const langOptions = [this.getSelectedLanguageOption(atom)];

    this.languageOptions.every(langOption => {
      if (
        this.state.atoms.every(atom => {
          return atom.locale_id !== langOption.value;
        })
      ) {
        langOptions.push(langOption);
      }
      return true;
    });

    return langOptions;
  }

  getSelectedLanguageOption(atom) {
    let result = null;
    this.languageOptions.some(langOption => {
      if (atom.locale_id === langOption.value) {
        result = langOption;
        return true;
      }

      return false;
    });

    return result;
  }

  getFreeLocale() {
    let result = null;
    this.props.locales.some(locale => {
      if (
        this.state.atoms.every(atom => {
          return atom.locale_id !== locale.id;
        })
      ) {
        result = locale.id;
        return true;
      }
    });

    return result;
  }

  onContentChange(event) {
    const textarea = event.target;

    if (textarea.value === textarea.defaultValue) {
      return;
    }

    const newAtoms = JSON.parse(JSON.stringify(this.state.atoms));
    newAtoms.some(atom => {
      if (atom.id.toString() === textarea.getAttribute('atomid').toString()) {
        atom.content = textarea.value;
        return true;
      }

      return false;
    });
    this.setState({ atoms: newAtoms });
  }

  onFocusTextArea(event) {
    const width = Math.min(window.screen.width, window.innerWidth);
    const el = event.target;

    if (width <= 767) {
      el.classList.remove('lingvo-gist-elem_textarea_fix');

      setTimeout(() => {
        el.setSelectionRange(el.value.length, el.value.length);
      }, 0);
    }
  }

  onBlurTextArea(event) {
    const width = Math.min(window.screen.width, window.innerWidth);
    const el = event.target;

    if (width <= 767) {
      el.classList.add('lingvo-gist-elem_textarea_fix'); 
    }
  }

  onLanguageChange(event, { value, defaultValue, atomid }) {
    if (value === defaultValue) {
      return;
    }

    const newAtoms = JSON.parse(JSON.stringify(this.state.atoms));
    newAtoms.some(atom => {
      if (atom.id.toString() === atomid.toString()) {
        atom.locale_id = value;
        return true;
      }

      return false;
    });
    this.setState({ atoms: newAtoms });
  }

  onDeleteAtom(event, { atomid }) {
    const newAtoms = JSON.parse(JSON.stringify(this.state.atoms));
    this.setState({ atoms: newAtoms.filter(atom => atom.id.toString() !== atomid.toString()) });
  }

  onAddTranslation() {
    const newAtoms = JSON.parse(JSON.stringify(this.state.atoms));
    const date = new Date();
    const date_str = date.toISOString() + date.getUTCMilliseconds().toString();
    newAtoms.push({ id: date_str, locale_id: this.getFreeLocale(), content: "" });
    this.setState({ atoms: newAtoms });
  }

  updateAtom(id, atom) {
    return {
      mutation: updateAtomMutation,
      variables: {
        id: id,
        locale_id: atom.locale_id,
        content: atom.content
      }
    };
  }

  createAtom(atom) {
    return {
      mutation: createAtomMutation,
      variables: {
        parent_id: this.state.gistId,
        locale_id: atom.locale_id,
        content: atom.content
      }
    };
  }

  deleteAtom(atom) {
    return {
      mutation: deleteAtomMutation,
      variables: {
        id: atom.id
      }
    };
  }

  executeSequence(mutations, newAtoms) {
    if (mutations.length == 0) {
      this.initialState = { atoms: newAtoms };
      this.setState({ atoms: newAtoms });
      return;
    }

    this.props.client.mutate(mutations.shift()).then(result => {
      const createResult = result.data.create_translationatom;
      if (createResult && createResult.triumph) {
        newAtoms.some(atom => {
          if (atom.locale_id === createResult.translationatom.locale_id) {
            atom.id = createResult.translationatom.id;
            return true;
          }
          return false;
        });
      }
      this.executeSequence(mutations, newAtoms);
    });
  }

  atomActions() {
    const { atoms } = this.initialState;
    const { atoms: newAtoms } = this.state;

    const mutations = [];
    newAtoms.forEach(newAtom => {
      const oldItem = atoms.find(a => a.id.toString() === newAtom.id.toString());
      if (oldItem) {
        if (oldItem.locale_id !== newAtom.locale_id || oldItem.content !== newAtom.content) {
          mutations.push(this.updateAtom(oldItem.id, newAtom));
        }
      } else {
        mutations.push(this.createAtom(newAtom));
      }
    });
    atoms.forEach(oldItem => {
      const newItem = newAtoms.find(a => a.id.toString() === oldItem.id.toString());
      if (!newItem) {
        mutations.push(this.deleteAtom(oldItem));
      }
    });
    if (mutations.length != 0) {
      this.executeSequence(mutations, JSON.parse(JSON.stringify(newAtoms)));
    }
  }

  onSave() {
    if (this.state.newGist) {
      const mutationsGist = [];
      mutationsGist.push(this.createTranslationGist());
      if (mutationsGist.length != 0) {
        const that = this;
        this.props.client.mutate(mutationsGist.shift()).then(result => {
          const idGist = result.data.create_translationgist.translationgist.id;

          /* idGist for method "createAtom" */
          that.setState({ newGist: false, gistId: idGist });

          that.atomActions();
        });
      }
    } else {
      this.atomActions();
    }
  }

  render() {
    const { atoms, newGist } = this.state;
    const currentLocaleId = locale.get();
    const atomsSort = [...atoms];
    
    /* sorting */
    atomsSort.sort((a, b) => {

      if (a && b && Array.isArray(a.id) && Array.isArray(b.id)) {

        let nameA = a.locale_id;
        if (nameA && nameA === 2) {
          nameA = -1;
        }

        let nameB = b.locale_id;
        if (nameB && nameB === 2) {
          nameB = -1;
        }
        
        /* sort string ascending */
        if (nameA && nameB && nameA < nameB) {
          return -1;
        }
        if (nameA && nameB && nameA > nameB) {
          return 1;
        }

      }
      
      /* default return value (no sorting) */
      return 0;
    });

    let header = "";

    const currentLocaleHeader = atoms.some(atom => {
      if (atom.locale_id === currentLocaleId && atom.content !== "") {
        header = atom.content;
        return true;
      }
      return false;
    });

    if (!currentLocaleHeader) {

      const englishLocaleHeader = atoms.some(atom => {
        if (atom.locale_id === 2 && atom.content !== "") {
          header = atom.content;
          return true;
        }
        return false;
      });
      
      if (!englishLocaleHeader) {
        atoms.some(atom => {
          if (atom.locale_id === 1 && atom.content !== "") {
            header = atom.content;
            return true;
          }
          return false;
        });
      }

    }

    return (
      <div className="lingvo-gist">
        <h4 className="lingvo-gist__header">{header}</h4>

        <div className="lingvo-atoms-grid">
          {atomsSort.map(atom => (
            <div className="lingvo-atom-grid" key={atom.id}>
              <div className="lingvo-atom-grid__text">
                <Popup 
                  disabled={ !!newGist }
                  trigger={
                    <TextareaAutosize 
                      defaultValue={atom.content}
                      onFocus={this.onFocusTextArea}
                      onBlur={this.onBlurTextArea} 
                      onChange={this.onContentChange} 
                      atomid={atom.id} 
                      className="lingvo-gist-elem lingvo-gist-elem_textarea lingvo-gist-elem_textarea_fix" 
                    />
                  }
                  hideOnScroll={true}
                  content={atom.content}
                  className="lingvo-popup-inverted lingvo-popup-inverted_gistatom"
                />
              </div>

              <div className="lingvo-atom-grid__lang">
                <Dropdown
                  className="lingvo-gist-elem lingvo-gist-elem_language"
                  key={atom.locale_id}
                  options={this.getAvailableLanguagesOptions(atom)}
                  value={atom.locale_id}
                  onChange={this.onLanguageChange}
                  atomid={atom.id}
                  selection
                  icon={<i className="lingvo-icon lingvo-icon_arrow" />}
                />
              </div>
              <div className="lingvo-atom-grid__delete">
                <Button
                  icon={<i className="lingvo-icon lingvo-icon_trash" />}
                  disabled={atoms.length === 1}
                  onClick={this.onDeleteAtom}
                  atomid={atom.id}
                  className="lingvo-button-atom-delete"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="lingvo-gist__buttons">
          <Button
            disabled={!this.getFreeLocale()}
            onClick={this.onAddTranslation}
            className="lingvo-button-basic-black lingvo-button-basic-black_small"
          >
            {this.context("Add Translation")}
          </Button>
          <Button
            disabled={JSON.stringify(this.state.atoms) === JSON.stringify(this.initialState.atoms)}
            onClick={this.onSave}
            className="lingvo-button-violet lingvo-button-violet_small"
          >
            {this.context("Save")}
          </Button>
        </div>
      </div>
    );
  }
}

EditAtoms.contextType = TranslationContext;

export default withApollo(EditAtoms);
