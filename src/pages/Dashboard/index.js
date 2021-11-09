import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, onlyUpdateForKeys, branch, renderNothing } from 'recompose';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Dimmer, Tab, Header, List, Dropdown, Icon, Popup } from 'semantic-ui-react';
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
    <Dropdown item text={translation} className="lingvo-dashboard-elem lingvo-dashboard-elem_status" icon={<i className="lingvo-icon lingvo-icon_arrow" />}>
      <Dropdown.Menu>
        {statuses.map(status => (
          <Dropdown.Item
            key={compositeIdToString(status.id)}
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
        <List.Content>
          
          <div className="lingvo-dashboard-block">
            <div className="lingvo-dashboard-block__small">

              <div className="lingvo-dashboard-group-elems">
                <Dropdown 
                  trigger={
                    <span><i className="lingvo-icon lingvo-icon_book" /> {translation}</span>
                  }
                  className="link item lingvo-dashboard-elem"
                  icon={<i className="lingvo-icon lingvo-icon_arrow" />}>
                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() => actions.openRoles(id, 'perspective', getTranslation('Roles'))}
                    >
                      <i className="lingvo-icon lingvo-icon_roles" /> {getTranslation('Roles')}
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => actions.openPerspectivePropertiesModal(id, parent_id, getTranslation('Properties'))}
                    >
                      <i className="lingvo-icon lingvo-icon_properties" /> {getTranslation('Properties')}
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => actions.openStatistics(id, 'perspective', getTranslation('Statistics'))}
                    >
                      <i className="lingvo-icon lingvo-icon_stats" /> {getTranslation('Statistics')}
                    </Dropdown.Item>
                    <Dropdown.Item 
                      onClick={this.onRemovePerspective} 
                    >
                      <i className="lingvo-icon lingvo-icon_delete" /> {getTranslation("Remove perspective")}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <div className="lingvo-dashboard-group-elems__block">
                  <Popup
                    trigger={
                      <a className="lingvo-dashboard-elem lingvo-dashboard-elem_button" 
                        href={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/view`}>
                        <i className="lingvo-icon lingvo-icon_view" />
                      </a>
                    }
                    content={getTranslation("View")}
                    className="lingvo-popup-inverted"
                  />

                  <Popup
                    trigger={
                      <a className="lingvo-dashboard-elem lingvo-dashboard-elem_button" 
                        href={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/edit`}>
                        <i className="lingvo-icon lingvo-icon_edit" />
                      </a>
                    }
                    content={getTranslation("Edit")}
                    className="lingvo-popup-inverted"
                  />

                  <Popup
                    trigger={
                      <a className="lingvo-dashboard-elem lingvo-dashboard-elem_button" 
                        href={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/publish`}>
                          <i className="lingvo-icon lingvo-icon_publish" />
                      </a>
                    }
                    content={getTranslation("Publish")}
                    className="lingvo-popup-inverted"
                  />

                  <a className="lingvo-dashboard-elem lingvo-dashboard-elem_button" 
                    href={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/contributions`}>
                    {getTranslation("Contributions")}
                  </a>

                </div>
              </div>

            </div>

            <div className="lingvo-dashboard-block__small">
              <PerspectiveStatuses translation={status} statusId={statusId} parentId={id} statuses={statuses} />
            </div>
          </div>

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
          <div className="lingvo-dashboard-block">
            <div className="lingvo-dashboard-block__big">
              <Dropdown text={translation} className="link item lingvo-dashboard-elem lingvo-dashboard-elem_main" icon={<i className="lingvo-icon lingvo-icon_arrow" />}>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => actions.openRoles(id, 'dictionary', getTranslation('Roles'))}
                  >
                    <i className="lingvo-icon lingvo-icon_roles" /> {getTranslation('Roles')}
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => actions.openDictionaryPropertiesModal(id, getTranslation('Properties'))}
                  >
                    <i className="lingvo-icon lingvo-icon_properties" /> {getTranslation('Properties')}
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => actions.openDictionaryOrganizationsModal(id)}
                  >
                    <i className="lingvo-icon lingvo-icon_organizations" /> {getTranslation('Organizations')}
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => actions.openStatistics(id, 'dictionary', getTranslation('Statistics'))}
                  >
                    <i className="lingvo-icon lingvo-icon_stats" /> {getTranslation('Statistics')}
                  </Dropdown.Item>
                  {/*<Dropdown.Item icon="circle" text={getTranslation("Create a new perspective...")} />*/}
                  <Dropdown.Item
                    onClick={() => actions.openSaveDictionaryModal(id)}
                  >
                    <i className="lingvo-icon lingvo-icon_save" /> {getTranslation("Save dictionary")}
                  </Dropdown.Item>
                  <Dropdown.Item 
                    onClick={this.onRemoveDictionary} 
                  >
                    <i className="lingvo-icon lingvo-icon_delete" /> {getTranslation("Remove dictionary")}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            <div className="lingvo-dashboard-block__small">
              <DicionaryStatuses translation={status} statusId={statusId} parentId={id} statuses={statuses} />
            </div>
          </div>
          
          <List relaxed className="lingvo-dashboard-subblock">
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
    <div className="lingvo-dashboard">
      <Dimmer.Dimmable dimmed={loading} style={dimmerStyle}>
        <Dimmer active={loading} inverted className="lingvo-dimmer">
          <Header as="h2" icon>
            <Icon name="spinner" loading className="lingvo-spinner" />
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
    </div>
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
      <Tab.Pane className="lingvo-tab__pane">
        <Dictionaries category={0} mode={0} />
      </Tab.Pane>
    ),
  },
  {
    menuItem: getTranslation('Available dictionaries'),
    render: () => (
      <Tab.Pane className="lingvo-tab__pane">
        <Dictionaries category={0} mode={1} />
      </Tab.Pane>
    ),
  },
];

const CORPORA_TABS = [
  {
    menuItem: getTranslation('My corpora'),
    render: () => (
      <Tab.Pane className="lingvo-tab__pane">
        <Dictionaries category={1} mode={0} />
      </Tab.Pane>
    ),
  },
  {
    menuItem: getTranslation('Available corpora'),
    render: () => (
      <Tab.Pane className="lingvo-tab__pane">
        <Dictionaries category={1} mode={1} />
      </Tab.Pane>
    ),
  },
];

const DictionaryDashboard = () => (
  <div className="background-content">
    <Tab className="inverted lingvo-tab" panes={DICTIONARIES_TABS} renderActiveOnly />
  </div>
);
const CorpusDashboard = () => (
  <div className="background-content">
    <Tab className="inverted lingvo-tab" panes={CORPORA_TABS} renderActiveOnly />
  </div>
);

export { DictionaryDashboard, CorpusDashboard };
