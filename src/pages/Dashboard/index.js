import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, onlyUpdateForKeys, branch, renderNothing } from 'recompose';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Container, Dimmer, Tab, Header, List, Dropdown, Icon, Menu } from 'semantic-ui-react';
import { isEqual } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';
import { openRoles } from 'ducks/roles';
import { openSaveDictionaryModal } from 'ducks/saveDictionary';
import { openModal as openDictionaryOrganizationsModal } from 'ducks/dictionaryOrganizations';
import { openDictionaryPropertiesModal } from 'ducks/dictionaryProperties';
import { openPerspectivePropertiesModal } from 'ducks/perspectiveProperties';
import { openStatistics } from 'ducks/statistics';
import { getTranslation } from 'api/i18n';

import { dictionaryQuery } from 'pages/DialeqtImport';

const dimmerStyle = { minHeight: '600px' };

export const query = gql`
  query dashboardQuery($mode: Int!, $category: Int!) {
    dictionaries(mode: $mode, category: $category) {
      id
      parent_id
      translation
      status
      state_translation_gist_id
      perspectives {
        id
        parent_id
        translation
        status
        state_translation_gist_id
      }
    }
    all_statuses {
      id
      created_at
      marked_for_deletion
      type
      translation
    }
  }
`;

const updateDictionaryStatusMutation = gql`
  mutation updateDictionaryStatus($id: LingvodocID!, $status_id: LingvodocID!) {
    update_dictionary_status(id: $id, state_translation_gist_id: $status_id) {
      triumph
    }
  }
`;

const updatePerspectiveStatusMutation = gql`
  mutation updatePerspectiveStatus($id: LingvodocID!, $status_id: LingvodocID!) {
    update_perspective_status(id: $id, state_translation_gist_id: $status_id) {
      triumph
    }
  }
`;

const removePerspectiveMutation = gql`
  mutation removePerspective($id: LingvodocID!) {
    delete_perspective(id: $id) {
      triumph
    }
  }
`;

const removeDictionaryMutation = gql`
  mutation removeDictionary($id: LingvodocID!) {
    delete_dictionary(id: $id) {
      triumph
    }
  }
`;

const Statuses = onlyUpdateForKeys(['translation'])(({
  translation, statusId, parentId, statuses, updateStatus,
}) => {
  const updateHandler = (id, sid) => {
    updateStatus({
      variables: { id, status_id: sid },
      refetchQueries: [
        {
          query,
          variables: {
            mode: 1,
            category: 0,
          },
        },
      ],
    });
  };

  return (
    <Dropdown item text={translation}>
      <Dropdown.Menu>
        {statuses.map(status => (
          <Dropdown.Item
            key={compositeIdToString(status.id)}
            icon="users"
            text={status.translation}
            active={isEqual(statusId, status.id)}
            onClick={() => updateHandler(parentId, status.id)}
          />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
});

// Dictionary and Perspective share the set of statuses but use different mutations to change current status.
const DicionaryStatuses = graphql(updateDictionaryStatusMutation, { name: 'updateStatus' })(Statuses);
const PerspectiveStatuses = graphql(updatePerspectiveStatusMutation, { name: 'updateStatus' })(Statuses);

class P extends React.Component {
  constructor(props) {
    super(props);
    this.onRemovePerspective = this.onRemovePerspective.bind(this);
  }

  onRemovePerspective() {
    const {
      id, mode, category, removePerspective,
    } = this.props;
    removePerspective({
      variables: {
        id,
      },
      refetchQueries: [
        {
          query,
          variables: {
            mode,
            category,
          },
        },
      ],
    });
  }

  render() {
    const {
      id, parent_id, translation, status, state_translation_gist_id: statusId, statuses, actions,
    } = this.props;
    return (
      <List.Item>
        <List.Icon verticalAlign="middle" name="book" />
        <List.Content>
          <Menu>
            <Dropdown text={translation} pointing className="link item">
              <Dropdown.Menu>
                <Dropdown.Item
                  icon="users"
                  text={`${getTranslation('Roles')}...`}
                  onClick={() => actions.openRoles(id, 'perspective', getTranslation('Roles'))}
                />
                <Dropdown.Item
                  icon="setting"
                  text={`${getTranslation('Properties')}...`}
                  onClick={() => actions.openPerspectivePropertiesModal(id, parent_id, getTranslation('Properties'))}
                />
                <Dropdown.Item
                  icon="percent"
                  text={`${getTranslation('Statistics')}...`}
                  onClick={() => actions.openStatistics(id, 'perspective', getTranslation('Statistics'))}
                />
                <Dropdown.Divider />
                <Dropdown.Item icon="remove" text={getTranslation("Remove perspective")} onClick={this.onRemovePerspective} />
              </Dropdown.Menu>
            </Dropdown>

            <Menu.Item as={Link} to={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/view`}>
              {getTranslation("View")}
            </Menu.Item>

            <Menu.Item as={Link} to={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/edit`}>
              {getTranslation("Edit")}
            </Menu.Item>

            <Menu.Item
              as={Link}
              to={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/publish`}
            >
              {getTranslation("Publish")}
            </Menu.Item>

            <Menu.Item
              as={Link}
              to={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/contributions`}
            >
              {getTranslation("Contributions")}
            </Menu.Item>

            <Menu.Menu position="right">
              <PerspectiveStatuses translation={status} statusId={statusId} parentId={id} statuses={statuses} />
            </Menu.Menu>
          </Menu>
        </List.Content>
      </List.Item>
    );
  }
}

P.propTypes = {
  id: PropTypes.array.isRequired,
  parent_id: PropTypes.array.isRequired,
  translation: PropTypes.string.isRequired,
  mode: PropTypes.number.isRequired,
  category: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
  state_translation_gist_id: PropTypes.array.isRequired,
  statuses: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  removePerspective: PropTypes.func.isRequired,
};

const Perspective = compose(
  connect(
    null,
    dispatch => ({
      actions: bindActionCreators({ openRoles, openPerspectivePropertiesModal, openStatistics }, dispatch),
    })
  ),
  graphql(removePerspectiveMutation, { name: 'removePerspective' }),
  onlyUpdateForKeys(['translation', 'status'])
)(P);

class D extends React.Component {
  constructor(props) {
    super(props);
    this.onRemoveDictionary = this.onRemoveDictionary.bind(this);
  }

  onRemoveDictionary() {
    const {
      id, mode, category, removeDictionary,
    } = this.props;
    removeDictionary({
      variables: {
        id,
      },
      refetchQueries: [
        {
          query,
          variables: {
            mode,
            category,
          },
        },
        { query: dictionaryQuery },
      ],
    });
  }

  render() {
    const {
      id,
      translation,
      status,
      state_translation_gist_id: statusId,
      perspectives,
      statuses,
      actions,
      mode,
      category,
    } = this.props;

    return (
      <List.Item>
        <List.Content>
          <Menu>
            <Dropdown text={translation} pointing className="link item">
              <Dropdown.Menu>
                <Dropdown.Item
                  icon="users"
                  text={`${getTranslation('Roles')}...`}
                  onClick={() => actions.openRoles(id, 'dictionary', getTranslation('Roles'))}
                />
                <Dropdown.Item
                  icon="setting"
                  text={`${getTranslation('Properties')}...`}
                  onClick={() => actions.openDictionaryPropertiesModal(id, getTranslation('Properties'))}
                />
                <Dropdown.Item
                  icon="address book"
                  text={`${getTranslation('Organizations')}...`}
                  onClick={() => actions.openDictionaryOrganizationsModal(id)}
                />
                <Dropdown.Item
                  icon="percent"
                  text={`${getTranslation('Statistics')}...`}
                  onClick={() => actions.openStatistics(id, 'dictionary', getTranslation('Statistics'))}
                />
                {/*<Dropdown.Item icon="circle" text={getTranslation("Create a new perspective...")} />*/}
                <Dropdown.Item
                  icon="save"
                  text={`${getTranslation("Save dictionary")}...`}
                  onClick={() => actions.openSaveDictionaryModal(id)}
                />
                <Dropdown.Divider />
                <Dropdown.Item icon="remove" text={getTranslation("Remove dictionary")} onClick={this.onRemoveDictionary} />
              </Dropdown.Menu>
            </Dropdown>

            <Menu.Menu position="right">
              <DicionaryStatuses translation={status} statusId={statusId} parentId={id} statuses={statuses} />
            </Menu.Menu>
          </Menu>
          <List relaxed>
            {perspectives.map(perspective => (
              <Perspective
                key={compositeIdToString(perspective.id)}
                {...perspective}
                category={category}
                mode={mode}
                as={List.Item}
                statuses={statuses}
              />
            ))}
          </List>
        </List.Content>
      </List.Item>
    );
  }
}

D.propTypes = {
  id: PropTypes.array.isRequired,
  perspectives: PropTypes.array.isRequired,
  translation: PropTypes.string.isRequired,
  mode: PropTypes.number.isRequired,
  category: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
  state_translation_gist_id: PropTypes.array.isRequired,
  statuses: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  removeDictionary: PropTypes.func.isRequired,
};

const Dictionary = compose(
  connect(
    null,
    dispatch => ({
      actions: bindActionCreators(
        {
          openRoles,
          openDictionaryPropertiesModal,
          openStatistics,
          openSaveDictionaryModal,
          openDictionaryOrganizationsModal,
        },
        dispatch
      ),
    })
  ),
  graphql(removeDictionaryMutation, { name: 'removeDictionary' }),
  onlyUpdateForKeys(['translation', 'status', 'perspectives'])
)(D);

const Dashboard = ({ data, mode, category }) => {
  const { loading, dictionaries, all_statuses: statuses } = data;
  return (
    <Container>
      <Dimmer.Dimmable dimmed={loading} style={dimmerStyle}>
        <Dimmer active={loading} inverted>
          <Header as="h2" icon>
            <Icon name="spinner" loading />
          </Header>
        </Dimmer>

        <List>
          {!loading &&
            dictionaries.map(dictionary => (
              <Dictionary
                key={compositeIdToString(dictionary.id)}
                statuses={statuses}
                category={category}
                mode={mode}
                {...dictionary}
              />
            ))}
        </List>
      </Dimmer.Dimmable>
    </Container>
  );
};

Dashboard.propTypes = {
  data: PropTypes.object.isRequired,
  mode: PropTypes.number.isRequired,
  category: PropTypes.number.isRequired,
};

const Dictionaries = compose(
  graphql(query),
  onlyUpdateForKeys(['data']),
  branch(({ data }) => !!data.error, renderNothing)
)(Dashboard);

const DICTIONARIES_TABS = [
  {
    menuItem: getTranslation('My dictionaries'),
    render: () => (
      <Tab.Pane>
        <Dictionaries category={0} mode={0} />
      </Tab.Pane>
    ),
  },
  {
    menuItem: getTranslation('Available dictionaries'),
    render: () => (
      <Tab.Pane>
        <Dictionaries category={0} mode={1} />
      </Tab.Pane>
    ),
  },
];

const CORPORA_TABS = [
  {
    menuItem: getTranslation('My corpora'),
    render: () => (
      <Tab.Pane>
        <Dictionaries category={1} mode={0} />
      </Tab.Pane>
    ),
  },
  {
    menuItem: getTranslation('Available corpora'),
    render: () => (
      <Tab.Pane>
        <Dictionaries category={1} mode={1} />
      </Tab.Pane>
    ),
  },
];

const DictionaryDashboard = () => (
  <div className="background-content">
    <Tab className="inverted" panes={DICTIONARIES_TABS} renderActiveOnly />
  </div>
);
const CorpusDashboard = () => (
  <div className="background-content">
    <Tab className="inverted" panes={CORPORA_TABS} renderActiveOnly />
  </div>
);

export { DictionaryDashboard, CorpusDashboard };
