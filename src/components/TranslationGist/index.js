import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { Container, Button, List } from 'semantic-ui-react';
import TranslationAtom from '../TranslationAtom';
import { compositeIdToString } from '../../utils/compositeId';
import { getTranslation } from 'api/i18n';

export const translationGistQuery = gql`
  query($id: LingvodocID!) {
    translationgist(id: $id) {
      id
      translationatoms {
        id
        parent_id
        locale_id
        content
        created_at
      }
    }
    all_locales
  }
`;

@graphql(translationGistQuery)
export default class TranslationGist extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      createdAtoms: [],
    };

    this.addAtom = this.addAtom.bind(this);
    this.onAtomCreated = this.onAtomCreated.bind(this);
  }

  onAtomCreated(id) {
    const { createdAtoms } = this.state;
    this.setState({
      createdAtoms: createdAtoms.filter(e => id !== e),
    });
  }

  addAtom = () => {
    const { createdAtoms } = this.state;
    const { all_locales, translationgist } = this.props.data;
    const nextId = this.getAvailableLocales(all_locales, translationgist.translationatoms)[0].id;
    this.setState({
      createdAtoms: [nextId, ...createdAtoms],
    });
  };

  getAvailableLocales(locales, atoms, currentAtomLocale) {
    let result = [];
    locales.forEach(locale => {
      if (locale.id == currentAtomLocale) {
        result.unshift(locale);
      }
      else if (atoms.every(atom => { return atom.locale_id != locale.id; }) && this.state.createdAtoms.every(id => { return id != locale.id; })) {
        result.push(locale);
      }
    });

    return result;
  }

  render() {
    const { data, editable, objectId, updateAtomMutation } = this.props;
    if (data.loading) {
      return null;
    }

    const atoms =
      data.translationgist.translationatoms.slice().sort((a, b) => (a.created_at > b.created_at ? 1 : 0)) || [];
    const locales = data.all_locales || [];

    return (
      <Container className="lingvo-container_margin-auto">
        <List>
          {atoms.map(atom => (
            <List.Item key={compositeIdToString(atom.id)}>
              <TranslationAtom
                objectId={objectId}
                id={atom.id}
                parentId={atom.parent_id}
                localeId={atom.locale_id}
                content={atom.content}
                locales={this.getAvailableLocales(locales, atoms, atom.locale_id)}
                editable={editable}
                updateAtomMutation={updateAtomMutation}
              />
            </List.Item>
          ))}
          {this.state.createdAtoms.map(id => (
            <List.Item key={id}>
              <TranslationAtom
                objectId={objectId}
                parentId={data.translationgist.id}
                localeId={id}
                locales={this.getAvailableLocales(locales, atoms, id)}
                editable={editable}
                onAtomCreated={() => this.onAtomCreated(id)}
                updateAtomMutation={updateAtomMutation}
              />
            </List.Item>
          ))}
        </List>
        <Button disabled={this.getAvailableLocales(locales, atoms).length == 0} onClick={this.addAtom} className="lingvo-button-violet">{getTranslation('Add')}</Button>
      </Container>
    );
  }
}

TranslationGist.propTypes = {
  objectId: PropTypes.array.isRequired,
  id: PropTypes.array.isRequired,
  editable: PropTypes.bool.isRequired,
  data: PropTypes.object,
  updateAtomMutation: PropTypes.func
};

TranslationGist.defaultProps = {
  id: [null, null],
  data: {},
};
