import React from 'react';
import PropTypes from 'prop-types';
import { graphql, gql } from 'react-apollo';

import { Container, Button, Input, Select } from 'semantic-ui-react';
import TranslationAtom from '../TranslationAtom';
import compositeIdToString from '../../utils/compositeId';


@graphql(gql`
  query ($id: [Int]) {
    translationgist(id: $id) {
      id, translationatoms {
        id locale_id content
      }
    }
    all_locales
  }`)
@graphql(gql`
  mutation ($parent_id: [Int], $locale_id: Int!, $content: String!) {
    create_translationatom( parent_id: $parent_id, locale_id: $locale_id, content: $content) {
            translationatom {
                id content
            }
            triumph
        }
  }`, { name: 'createTranslationAtom' })
export default class TranslationGist extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeAtom = this.onChangeAtom.bind(this);
    this.onCreateAtom = this.onCreateAtom.bind(this);
  }

  onChangeAtom = atom => ({ atom });

  onCreateAtom = () => {
    this.props.createTranslationAtom({
      variables: { repoFullName: 'apollographql/apollo-client' },
    });
  };

  render() {
    const { data, editable } = this.props;

    if (data.loading) {
      return null;
    }

    const atoms = data.translationgist.translationatoms || [];
    const locales = data.all_locales || [];

    return (<Container>
      <ul>
        {atoms.map(atom => (
          <li key={compositeIdToString(atom.id)}>
            <TranslationAtom
              atom={atom}
              locales={locales}
              editable={editable}
              onSave={this.onChangeAtom}
            />
          </li>
        ))}
      </ul>
      <Button onClick={this.onCreateAtom} />
    </Container>);
  }
}

TranslationGist.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  id: PropTypes.array.isRequired,
  editable: PropTypes.bool.isRequired,
  data: PropTypes.object,
  createTranslationAtom: PropTypes.func,
};

TranslationGist.defaultProps = {
  data: {},
  createTranslationAtom: () => {},
};
