import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { map } from 'lodash';
import { onlyUpdateForKeys, withHandlers, withState, compose } from 'recompose';
import { Switch, Route, Redirect, Link } from 'react-router-dom';
import { Container, Header, Breadcrumb, Menu, Dropdown } from 'semantic-ui-react';
import PerspectiveView from 'components/PerspectiveView';
import Merge from 'components/Merge';
import NotFound from 'pages/NotFound';

import './style.scss';
import { queryLexicalEntries } from '../../components/PerspectiveView';

export const launchSoundAndMarkupMutation = gql`
  mutation launchSoundAndMarkup(
    $perspectiveId: LingvodocID!,
    $publishedMode: String!) {
      sound_and_markup(
        perspective_id: $perspectiveId,
        published_mode: $publishedMode)
      { triumph } }
`;

const query = gql`
  query q($id: LingvodocID!) {
    perspective(id: $id) {
      tree {
        id
        translation
      }
    }
  }
`;

const queryCounter = gql`
  query qcounter($id: LingvodocID! $mode: String!) {
    perspective(id: $id) {
      counter(mode: $mode)
    }
  }
`;

const PerspectivePath = graphql(query)(({ data }) => {
  if (data.loading || data.error) {
    return null;
  }
  const { perspective: { tree } } = data;
  return (
    <Header as="h2">
      <Breadcrumb
        icon="right angle"
        sections={tree
          .slice()
          .reverse()
          .map(e => ({ key: e.id, content: e.translation, link: false }))}
      />
    </Header>
  );
});

const Counter = graphql(queryCounter)(({ data }) => {
  if (data.loading || data.error) {
    return null;
  }
  const { perspective: { counter } } = data;
  return ` (${counter})`;
});

// const EditText = 'all';

const MODES = {
  edit: {
    entitiesMode: 'all',
    text: 'Edit',
    component: PerspectiveView,
  },
  publish: {
    entitiesMode: 'all',
    text: 'Publish',
    component: PerspectiveView,
  },
  view: {
    entitiesMode: 'published',
    text: 'View published',
    component: PerspectiveView,
  },
  contributions: {
    entitiesMode: 'not_accepted',
    text: 'View contributions',
    component: PerspectiveView,
  },
  merge: {
    entitiesMode: 'all',
    text: 'Merge suggestions',
    component: Merge,
  },
};

const handlers = compose(
  withState('value', 'updateValue', props => props.filter),
  withHandlers({
    onChange(props) {
      return event => props.updateValue(event.target.value);
    },
    onSubmit(props) {
      return (event) => {
        event.preventDefault();
        props.submitFilter(props.value);
      };
    },
  })
);

const Filter = handlers(({ value, onChange, onSubmit }) => (
  <div className="ui right aligned category search item">
    <form className="ui transparent icon input" onSubmit={onSubmit}>
      <input type="text" placeholder="Filter" value={value} onChange={onChange} />
      <button type="submit">
        <i className="search link icon" />
      </button>
    </form>
  </div>
));

const ModeSelector = onlyUpdateForKeys([
  'mode',
  'baseUrl',
  'filter',
])(({
  mode, baseUrl, filter,
  submitFilter,
  openCognateAnalysisModal,
  openPhonemicAnalysisModal,
  openPhonologyModal,
  soundAndMarkup,
  id,
}) => (
  <Menu tabular>
    {map(MODES, (info, stub) => (
      <Menu.Item key={stub} as={Link} to={`${baseUrl}/${stub}`} active={mode === stub}>
        {info.text}
        {info.component === PerspectiveView ? (<Counter
          id={id}
          mode={info.entitiesMode}
        />) : null}
      </Menu.Item>
    ))}
    <Dropdown item text="Tools">
      <Dropdown.Menu>
        <Dropdown.Item onClick={openCognateAnalysisModal}>Cognate analysis</Dropdown.Item>
        <Dropdown.Item onClick={openPhonemicAnalysisModal}>Phonemic analysis</Dropdown.Item>
        <Dropdown.Item onClick={openPhonologyModal}>Phonology</Dropdown.Item>
        <Dropdown.Item onClick={soundAndMarkup}>Sound and markup</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>

    <Menu.Menu position="right">
      <Filter filter={filter} submitFilter={submitFilter} />
    </Menu.Menu>
  </Menu>
));

const soundAndMarkup = (perspectiveId, mode, launchSoundAndMarkup) => {
  launchSoundAndMarkup({
    variables: {
      perspectiveId,
      publishedMode: mode == 'edit' ? 'all' : 'published',
    },
  }).then(
    () => {
      window.logger.suc('Sound and markup compilation is being created. Check out tasks for details.');
    },
    () => {
      window.logger.err('Failed to launch sound and markup compilation!');
    }
  );
};

const Perspective = ({
  perspective,
  submitFilter,
  openCognateAnalysisModal,
  openPhonemicAnalysisModal,
  openPhonologyModal,
  launchSoundAndMarkup,
}) => {
  const {
    id, mode, page, baseUrl,
  } = perspective.params;

  if (!baseUrl) return null;

  return (
    <Container fluid className="perspective">
      <PerspectivePath id={id} />
      <ModeSelector
        mode={mode}
        id={id}
        baseUrl={baseUrl}
        filter={perspective.filter}
        submitFilter={submitFilter}
        openCognateAnalysisModal={() => openCognateAnalysisModal(id)}
        openPhonemicAnalysisModal={() => openPhonemicAnalysisModal(id)}
        openPhonologyModal={() => openPhonologyModal(id)}
        soundAndMarkup={() => soundAndMarkup(id, mode, launchSoundAndMarkup)}
      />
      <Switch>
        <Redirect exact from={baseUrl} to={`${baseUrl}/view`} />
        {map(MODES, (info, stub) => (
          <Route
            key={stub}
            path={`${baseUrl}/${stub}`}
            render={() => (
              <info.component
                id={id}
                mode={mode}
                entitiesMode={info.entitiesMode}
                page={page}
                filter={perspective.filter}
                className="content"
              />
            )}
          />
        ))}
        <Route component={NotFound} />
      </Switch>
    </Container>
  );
};

Perspective.propTypes = {
  perspective: PropTypes.object.isRequired,
  submitFilter: PropTypes.func.isRequired,
  openCognateAnalysisModal: PropTypes.func.isRequired,
  openPhonemicAnalysisModal: PropTypes.func.isRequired,
  openPhonologyModal: PropTypes.func.isRequired,
};

export default
graphql(launchSoundAndMarkupMutation, { name: 'launchSoundAndMarkup' })(Perspective);
