import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import { Header, Breadcrumb, Dropdown } from 'semantic-ui-react';
import { openRoles } from 'ducks/roles';
import { openModal as openDictionaryOrganizationsModal } from 'ducks/dictionaryOrganizations';
import { openDictionaryPropertiesModal } from 'ducks/dictionaryProperties';
import { openPerspectivePropertiesModal } from 'ducks/perspectiveProperties';
import { openSaveDictionaryModal } from 'ducks/saveDictionary';
import { openStatistics } from 'ducks/statistics';
import { getTranslation } from 'api/i18n';

const queryPerspectivePath = gql`
  query queryPerspectivePath($id: LingvodocID!) {
    perspective(id: $id) {
      id
      tree {
        id
        translation
      }
    }
  }
`;

const queryAvailablePerspectives = gql`
  query availablePerspectives($dictionary_id: LingvodocID!) {
    dictionary(id: $dictionary_id) {
      perspectives {
        id
        parent_id
        translation
      }
    }
  }
`;

/**
 * Perspective breadcrumb component.
 */
class PerspectivePath extends React.Component {
  render() {
    const {
      id, dictionary_id, queryPerspectivePath, queryAvailablePerspectives, mode, className, actions, user
    } = this.props;

    if (queryPerspectivePath.loading || queryPerspectivePath.error || queryAvailablePerspectives.loading || queryAvailablePerspectives.error) {
      return null;
    }

    const { perspective: { tree } } = queryPerspectivePath;
    const { perspectives } = queryAvailablePerspectives.dictionary;

    return (
      <Header as="h2" className={className}>
        <Breadcrumb
          icon="right angle"
          sections={tree.slice().reverse().map((e, index) => ({
              key: e.id,
              content:

                index === tree.length - 1 ?

                  <Dropdown inline text={e.translation}>
                    <Dropdown.Menu>

                      {perspectives.length > 1 && [

                        (perspectives.filter(pers => pers.id !== tree[0].id).map(pers => (
                          <Dropdown.Item
                            key={pers.id}
                            as={Link}
                            to={`/dictionary/${pers.parent_id.join('/')}/perspective/${pers.id.join('/')}/${mode}`}
                            icon="chevron right"
                            text={pers.translation}
                          />))
                        ),

                        <Dropdown.Divider
                          key="divider"
                        />
                      ]}

                      { user.id !== undefined &&
                        [
                          <Dropdown.Item
                            key="roles"
                            icon="users"
                            text={`'${e.translation}' ${getTranslation('Roles').toLowerCase()}...`}
                            onClick={() => actions.openRoles(id, 'perspective', `'${e.translation}' ${getTranslation('Roles').toLowerCase()}`)}
                          />,
                          <Dropdown.Item
                            key="properties"
                            icon="setting"
                            text={`'${e.translation}' ${getTranslation('Properties').toLowerCase()}...`}
                            onClick={() => actions.openPerspectivePropertiesModal(id, dictionary_id, `'${e.translation}' ${getTranslation('Propeties').toLowerCase()}`)}
                          />
                        ]
                      }
                      <Dropdown.Item
                        key="statistics"
                        icon="percent"
                        text={`'${e.translation}' ${getTranslation('Statistics').toLowerCase()}...`}
                        onClick={() => actions.openStatistics(id, 'perspective', `'${e.translation}' ${getTranslation('Statistics').toLowerCase()}`)}
                      />

                    </Dropdown.Menu>
                  </Dropdown> :

                index === tree.length - 2 ?

                  <Dropdown inline text={e.translation}>
                    <Dropdown.Menu>

                      {user.id !== undefined && [

                        <Dropdown.Item
                          key="roles"
                          icon="users"
                          text={`'${e.translation}' ${getTranslation('Roles').toLowerCase()}...`}
                          onClick={() => actions.openRoles(dictionary_id, 'dictionary', `'${e.translation}' ${getTranslation('Roles').toLowerCase()}`)}
                        />,

                        <Dropdown.Item
                          key="properties"
                          icon="setting"
                          text={`'${e.translation}' ${getTranslation('Properties').toLowerCase()}...`}
                          onClick={() => actions.openDictionaryPropertiesModal(dictionary_id, `'${e.translation}' ${getTranslation('Propeties').toLowerCase()}`)}
                        />,

                        <Dropdown.Item
                          key="organizations"
                          icon="address book"
                          text={`'${e.translation}' ${getTranslation('Organizations').toLowerCase()}...`}
                          onClick={() => actions.openDictionaryOrganizationsModal(dictionary_id, `'${e.translation}' ${getTranslation('Propeties').toLowerCase()}`)}
                        />,

                      ]}

                      <Dropdown.Item
                        key="statistics"
                        icon="percent"
                        text={`'${e.translation}' ${getTranslation('Statistics').toLowerCase()}...`}
                        onClick={() => actions.openStatistics(dictionary_id, 'dictionary', `'${e.translation}' ${getTranslation('Statistics').toLowerCase()}`)}
                      />

                      <Dropdown.Item
                        key="save"
                        icon="save"
                        text={`${getTranslation('Save dictionary')} '${e.translation}'...`}
                        onClick={() => actions.openSaveDictionaryModal(dictionary_id)}
                      />

                    </Dropdown.Menu>
                  </Dropdown> :

                e.translation,

              link: false
            }))}
        />
      </Header>
    );
  }
}

PerspectivePath.propTypes = {
  className: PropTypes.string,
};

PerspectivePath.defaultProps = {
  className: 'white',
};

export default compose(
  connect(
    state => state.user,
    dispatch => ({
      actions: bindActionCreators(
        {
          openDictionaryOrganizationsModal,
          openDictionaryPropertiesModal,
          openPerspectivePropertiesModal,
          openRoles,
          openSaveDictionaryModal,
          openStatistics
        },
        dispatch
      ),
    })
  ),
  graphql(queryPerspectivePath, {
    name: 'queryPerspectivePath',
    options: props => ({ variables: { id: props.id } })
  }),
  graphql(queryAvailablePerspectives, {
    name: 'queryAvailablePerspectives',
    options: props => ({ variables: { dictionary_id: props.dictionary_id } })
  })
)(PerspectivePath);
