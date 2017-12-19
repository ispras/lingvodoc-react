import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, pure, onlyUpdateForKeys } from 'recompose';
import { Link } from 'react-router-dom';
import { gql, graphql } from 'react-apollo';
import { Container, Dimmer, Tab, Header, List, Dropdown, Icon, Menu } from 'semantic-ui-react';
import { isEqual } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';
import { openRoles } from 'ducks/roles';
import { openDictionaryPropertiesModal } from 'ducks/properties';
import RolesModal from 'components/RolesModal';

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
    update_dictionary_status(id: $id, state_translation_gist_id: $status_id) {
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

const P = (props) => {
  const {
    id, parent_id, translation, status, state_translation_gist_id: statusId, statuses, actions,
  } = props;
  return (
    <List.Item>
      <List.Icon verticalAlign="middle" name="book" />
      <List.Content>
        <Menu>
          <Dropdown text={translation} pointing className="link item">
            <Dropdown.Menu>
              <Dropdown.Item icon="users" text="Roles..." onClick={() => actions.openRoles(id, 'perspective')} />
              <Dropdown.Item icon="setting" text="Properties..." />
              <Dropdown.Item icon="percent" text="Statistics..." />
              <Dropdown.Divider />
              <Dropdown.Item icon="remove" text="Remove perspective" />
            </Dropdown.Menu>
          </Dropdown>

          <Menu.Item as={Link} to={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/view`}>
            View
          </Menu.Item>

          <Menu.Item as={Link} to={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/edit`}>
            Edit
          </Menu.Item>

          <Menu.Item as={Link} to={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/publish`}>
            Publish
          </Menu.Item>

          <Menu.Item
            as={Link}
            to={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/contributions`}
          >
            Contributions
          </Menu.Item>

          <Menu.Menu position="right">
            <PerspectiveStatuses translation={status} statusId={statusId} parentId={id} statuses={statuses} />
          </Menu.Menu>
        </Menu>
      </List.Content>
    </List.Item>
  );
};

const Perspective = compose(
  connect(
    null,
    dispatch => ({
      actions: bindActionCreators({ openRoles }, dispatch),
    })
  ),
  onlyUpdateForKeys(['translation', 'status'])
)(P);

const D = (props) => {
  const {
    id, translation, status, state_translation_gist_id: statusId, perspectives, statuses, actions,
  } = props;

  return (
    <List.Item>
      <List.Content>
        <Menu>
          <Dropdown text={translation} pointing className="link item">
            <Dropdown.Menu>
              <Dropdown.Item icon="users" text="Roles..." onClick={() => actions.openRoles(id, 'dictionary')} />
              <Dropdown.Item icon="setting" text="Properties..." onClick={() => actions.openDictionaryPropertiesModal(id)} />
              <Dropdown.Item icon="percent" text="Statistics..." />
              <Dropdown.Item icon="circle" text="Create a new perspective..." />
              <Dropdown.Divider />
              <Dropdown.Item icon="remove" text="Remove dictionary" />
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
              as={List.Item}
              statuses={statuses}
            />
          ))}
        </List>
      </List.Content>
    </List.Item>
  );
};

const Dictionary = compose(
  connect(
    null,
    dispatch => ({
      actions: bindActionCreators({ openRoles, openDictionaryPropertiesModal }, dispatch),
    })
  ),
  onlyUpdateForKeys(['translation', 'status', 'perspectives'])
)(D);

const Dashboard = pure(({ data }) => {
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
              <Dictionary key={compositeIdToString(dictionary.id)} statuses={statuses} {...dictionary} />
            ))}
        </List>
      </Dimmer.Dimmable>
      <RolesModal />
    </Container>
  );
});

Dashboard.propTypes = {
  data: PropTypes.object.isRequired,
  mode: PropTypes.number.isRequired,
  category: PropTypes.number.isRequired,
};

const Dictionaries = graphql(query)(Dashboard);

const DICTIONARIES_TABS = [
  {
    menuItem: 'My dictionaries',
    render: () => (
      <Tab.Pane>
        <Dictionaries category={0} mode={0} />
      </Tab.Pane>
    ),
  },
  {
    menuItem: 'Available dictionaries',
    render: () => (
      <Tab.Pane>
        <Dictionaries category={0} mode={1} />
      </Tab.Pane>
    ),
  },
];

const CORPORA_TABS = [
  {
    menuItem: 'My corpora',
    render: () => (
      <Tab.Pane>
        <Dictionaries category={1} mode={0} />
      </Tab.Pane>
    ),
  },
  {
    menuItem: 'Available corpora',
    render: () => (
      <Tab.Pane>
        <Dictionaries category={1} mode={1} />
      </Tab.Pane>
    ),
  },
];

const DictionaryDashboard = () => <Tab panes={DICTIONARIES_TABS} renderActiveOnly />;
const CorpusDashboard = () => <Tab panes={CORPORA_TABS} renderActiveOnly />;

export { DictionaryDashboard, CorpusDashboard };
