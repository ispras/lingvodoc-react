import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { graphql, gql } from 'react-apollo';

import { Container, Button, Icon } from 'semantic-ui-react';

import CreateModal from '../../components/CreateLanguageModal';
import EditModal from '../../components/EditLanguageModal';

import languageListToTree from './utils';
import compositeIdToString from '../../utils/compositeId';


import * as actions from '../../ducks/language';

function Language({ language, create, edit }) {
  return (<ul>
    <li>{language.translation}

      <Button.Group size="tiny" basic compact icon>
        <Button onClick={() => create(language)}>
          <Icon name="plus" />
        </Button>
        <Button onClick={() => edit(language)}>
          <Icon name="setting" />
        </Button>
      </Button.Group>

      <ul>
        {language.languages.map(lang => (
          <Language
            key={compositeIdToString(lang.id)}
            language={lang}
            create={create}
            edit={edit}
          />
        ))}
      </ul>
    </li>
  </ul>);
}

Language.propTypes = {
  language: PropTypes.object.isRequired,
  create: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
};


@graphql(gql`
  query Languages {
    languages {
      id
      parent_id
      translation
      created_at
      translation_gist_id
    }
  }
`)
class Languages extends React.Component {
  render() {
    const { data } = this.props;
    const { actions: { openModalCreate, openModalEdit, closeModal } } = this.props;
    const { state } = this.props;

    if (data.loading) {
      return null;
    }

    const tree = languageListToTree(data.languages);

    let modal;
    if (state.language) {
      modal = <EditModal language={state.language} close={closeModal} />;
    } else if (state.parent) {
      modal = <CreateModal parent={state.parent} close={closeModal} />;
    }

    return (
      <Container>
        <ul>
          {tree.map(language => (
            <Language
              key={compositeIdToString(language.id)}
              language={language}
              edit={openModalEdit}
              create={openModalCreate}
            />
          ))}
        </ul>
        <span>{modal}</span>
      </Container>
    );
  }
}

Languages.propTypes = {
  data: PropTypes.object,
  actions: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
};

Languages.defaultProps = {
  data: {},
};

const mapStateToProps = state => ({
  state: state.language,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Languages);
