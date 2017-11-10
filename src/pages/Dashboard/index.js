import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { gql, graphql } from 'react-apollo';
import { Container, Dimmer, Tab, Header, List, Dropdown, Icon, Menu } from 'semantic-ui-react';
import { compositeIdToString } from 'utils/compositeId';
const dimmerStyle = { minHeight: '600px' };



const TABS = [
  { menuItem: 'My dictionaries', render: () => <Tab.Pane>
    <Dictionaries my_dictionaries available={false} />
    </Tab.Pane> },
  { menuItem: 'Available dictionaries', render: () => <Tab.Pane>
    <Dictionaries available my_dictionaries={false} />
  </Tab.Pane> },
]


const Perspective = props => {
  const { as: Component, id, parent_id, translation, status } = props;
  return <Component>
    <Menu>
      <Dropdown text={translation} pointing className="link item">
        <Dropdown.Menu>
          <Dropdown.Item icon="users" text="Roles..."/>
          <Dropdown.Item icon="setting" text="Properties..."/>
          <Dropdown.Item icon="percent" text="Statistics..."/>
          <Dropdown.Divider />
          <Dropdown.Item icon="remove" text="Remove perspective"/>
        </Dropdown.Menu>
      </Dropdown>
      
      <Menu.Item as={Link} to={`dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/view`}>
        View
      </Menu.Item>

      <Menu.Item as={Link} to={`dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/edit`}>
        Edit
      </Menu.Item>

      <Menu.Item as={Link} to={`dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/publish`}>
        Publish
      </Menu.Item>

      <Menu.Item as={Link} to={`dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/contributions`}>
        Contributions
      </Menu.Item>

      <Menu.Item position="right">
        {status}
      </Menu.Item>

    </Menu>
  </Component>;
};


const Dictionary = props => {
  const { as: Component, translation, status, perspectives } = props;
  return <Component>
    <Menu>
      <Dropdown text={translation} pointing className="link item">
        <Dropdown.Menu>
          <Dropdown.Item icon="users" text="Roles..."/>
          <Dropdown.Item icon="setting" text="Properties..."/>
          <Dropdown.Item icon="percent" text="Statistics..."/>
          <Dropdown.Item icon="circle" text="Create a new perspective..."/>
          <Dropdown.Divider />
          <Dropdown.Item icon="remove" text="Remove dictionary"/>
        </Dropdown.Menu>
      </Dropdown>

      <Menu.Item position="right">
        {status}
      </Menu.Item>

    </Menu>

    <List relaxed>
      {perspectives.map(perspective => <Perspective key={compositeIdToString(perspective.id)} {...perspective} as={List.Item} />)}
    </List>
  </Component>;
};

export const query = gql`
  query dashboardQuery($available: Boolean!, $my_dictionaries: Boolean!) {
    dictionaries(available: $available, my_dictionaries: $my_dictionaries) {
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
    }
  }
`;
const Dashboard = ({ data }) => {
  const { loading, dictionaries } = data;
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
              <Dictionary key={compositeIdToString(dictionary.id)} {...dictionary} as={List.Item} />
            ))}
        </List>
      </Dimmer.Dimmable>
    </Container>
  );
};

 const Dictionaries = graphql(query)(Dashboard);

export default () => (
  <Tab panes={TABS} renderActiveOnly={true} />
)
