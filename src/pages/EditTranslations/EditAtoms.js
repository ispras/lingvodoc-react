import React from 'react';
import { Segment, Header, Grid, Input, Button, Dropdown } from 'semantic-ui-react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import locale from 'api/locale';
import { i18n } from '../EditTranslations';

const createAtomMutation = gql`
  mutation ($parent_id: LingvodocID!, $locale_id: Int!, $content: String!) {
    create_translationatom( parent_id: $parent_id, locale_id: $locale_id, content: $content) {
      translationatom {
        id
        locale_id
      }
      triumph
    }
  }
`;

const updateAtomMutation = gql`
  mutation updateAtom($id: LingvodocID!, $locale_id: Int!, $content: String!) {
    update_translationatom(id: $id, locale_id: $locale_id, content: $content) {
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
      atoms: props.atoms
    };

    this.initialState = {
      atoms: props.atoms
    };
    this.languageOptions = props.locales.map(locale => {
      return { key: locale.id, value: locale.id, text: locale.intl_name};
    });

    this.onContentChange = this.onContentChange.bind(this);
    this.onLanguageChange = this.onLanguageChange.bind(this);
    this.onDeleteAtom = this.onDeleteAtom.bind(this);
    this.onAddTranslation = this.onAddTranslation.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  getAvailableLanguagesOptions(atom) {
    let langOptions = [ this.getSelectedLanguageOption(atom) ];

    this.languageOptions.every(langOption => {
      if (this.state.atoms.every(atom => { return atom.locale_id != langOption.value; })) {
        langOptions.push(langOption);
      }
      return true;
    });

    return langOptions;
  }

  getSelectedLanguageOption(atom) {
    let result = null;
    this.languageOptions.some(langOption => {
      if (atom.locale_id == langOption.value) {
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
      if (this.state.atoms.every(atom => { return atom.locale_id != locale.id; })) {
        result = locale.id;
        return true;
      }
    });

    return result;
  }

  onContentChange(event, { value, defaultValue, atomid }) {
    if (value == defaultValue) {
      return;
    }

    let newAtoms = JSON.parse(JSON.stringify(this.state.atoms));
    newAtoms.some(atom => {
      if (atom.id.toString() == atomid.toString()) {
        atom.content = value;
        return true;
      }

      return false;
    });
    this.setState( { atoms: newAtoms} );
  }

  onLanguageChange(event, { value, defaultValue, atomid }) {
    if (value == defaultValue) {
      return;
    }

    let newAtoms = JSON.parse(JSON.stringify(this.state.atoms));
    newAtoms.some(atom => {
      if (atom.id.toString() == atomid.toString()) {
        atom.locale_id = value;
        return true;
      }

      return false;
    });
    this.setState( { atoms: newAtoms} );
  }

  onDeleteAtom(event, { atomid }) {
    let newAtoms = JSON.parse(JSON.stringify(this.state.atoms));
    this.setState({ atoms: newAtoms.filter(atom => atom.id.toString() != atomid.toString()) });
  }

  onAddTranslation() {
    let newAtoms = JSON.parse(JSON.stringify(this.state.atoms));
    newAtoms.push({ id: new Date().getUTCMilliseconds(), locale_id: this.getFreeLocale(), content: ''});
    this.setState( { atoms: newAtoms} );
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
        parent_id: this.props.gistId,
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
      let createResult = result.data.create_translationatom;
      if (createResult && createResult.triumph) {
        newAtoms.some(atom => {
          if (atom.locale_id == createResult.translationatom.locale_id) {
            atom.id = createResult.translationatom.id;
            return true;
          }

          return false;
        });
      }
      this.executeSequence(mutations, newAtoms);
    });
  }

  onSave() {
    const { atoms } = this.initialState;
    let { atoms: newAtoms } = this.state;
    const total = Math.max(atoms.length, newAtoms.length);
    let mutations = [];
    for (let i = 0; i < total; i++) {
      if (i >= atoms.length) {
        mutations.push(this.createAtom(newAtoms[i]));
      }
      else if (i >= newAtoms.length) {
        mutations.push(this.deleteAtom(atoms[i]));
      }
      else {
        let atom = atoms[i];
        let newAtom = newAtoms[i];
        if (atom.locale_id != newAtom.locale_id || atom.content != newAtom.content) {
          mutations.push(this.updateAtom(atom.id, newAtom));
        }
      }
    }
    if (mutations.length != 0) {
      this.executeSequence(mutations, JSON.parse(JSON.stringify(newAtoms)));
    }
  }

  render() {
    const { atoms } = this.state;
    const currentLocaleId = locale.get();

    let header = '';
    atoms.some(atom => {
      if (atom.locale_id == currentLocaleId) {
        header = atom.content;
        return true;
      }

      return false;
    });

    return (
      <Segment>
        <Header as='h4' textAlign='center' block>{header}</Header>
          <Grid columns={2} celled>
            {atoms.map(atom => (
              <Grid.Row key={atom.id}>
                <Grid.Column width={12}>
                  <Input value={atom.content} onChange={this.onContentChange} atomid={atom.id} fluid/>
                </Grid.Column>
                <Grid.Column width={3}>
                  <Dropdown key={atom.locale_id} options={this.getAvailableLanguagesOptions(atom)} value={atom.locale_id} onChange={this.onLanguageChange} atomid={atom.id} selection/>
                </Grid.Column>
                <Grid.Column width={1}>
                  <Button icon='delete' color='red' disabled={atoms.length == 1} onClick={this.onDeleteAtom} atomid={atom.id}/>
                </Grid.Column>
              </Grid.Row>
            ))}
          </Grid>
          <Grid columns={1} centered>
            <Grid.Column textAlign='center'>
              <Button disabled={this.getFreeLocale() == null} onClick={this.onAddTranslation}>{i18n[9] || 'Add Translation'}</Button>
              <Button disabled={JSON.stringify(this.state) === JSON.stringify(this.initialState)} onClick={this.onSave}>{i18n[10] || 'Save'}</Button>
            </Grid.Column>
          </Grid>
      </Segment>
    );
  }

}

export default withApollo(EditAtoms);
