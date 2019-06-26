import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { map } from 'lodash';
import { onlyUpdateForKeys, withHandlers, withState, compose } from 'recompose';
import { Switch, Route, Redirect, Link } from 'react-router-dom';
import { Container, Menu, Dropdown } from 'semantic-ui-react';
import PerspectiveView from 'components/PerspectiveView';
import Merge from 'components/Merge';
import NotFound from 'pages/NotFound';
import PerspectivePath from './PerspectivePath';
import { getTranslation } from 'api/i18n';

import './style.scss';

export const launchSoundAndMarkupMutation = gql`
  mutation launchSoundAndMarkup(
    $perspectiveId: LingvodocID!,
    $publishedMode: String!) {
      sound_and_markup(
        perspective_id: $perspectiveId,
        published_mode: $publishedMode)
      { triumph } }
`;

const queryCounter = gql`
  query qcounter($id: LingvodocID! $mode: String!) {
    perspective(id: $id) {
      counter(mode: $mode)
    }
  }
`;

const Counter = graphql(queryCounter)(({ data }) => {
  if (data.loading || data.error) {
    return null;
  }
  const { perspective: { counter } } = data;
  return ` (${counter})`;
});

const MODES = {
  edit: {
    entitiesMode: 'all',
    text: getTranslation('Edit'),
    component: PerspectiveView,
  },
  publish: {
    entitiesMode: 'all',
    text: getTranslation('Publish'),
    component: PerspectiveView,
  },
  view: {
    entitiesMode: 'published',
    text: getTranslation('View published'),
    component: PerspectiveView,
  },
  contributions: {
    entitiesMode: 'not_accepted',
    text: getTranslation('View contributions'),
    component: PerspectiveView,
  },
  merge: {
    entitiesMode: 'all',
    text: getTranslation('Merge suggestions'),
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
      <input className="white" type="text" placeholder={getTranslation("Filter")} value={value} onChange={onChange} />
      <button type="submit" className="white">
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
  openCognateAcousticAnalysisModal,
  openCognateReconstructionModal,
  openPhonemicAnalysisModal,
  openPhonologyModal,
  openPhonologicalStatisticalDistanceModal,
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
    <Dropdown item text={getTranslation("Tools")}>
      <Dropdown.Menu>
        <Dropdown.Item onClick={openCognateAnalysisModal}>{getTranslation("Cognate analysis")}</Dropdown.Item>
        <Dropdown.Item onClick={openCognateAcousticAnalysisModal}>{getTranslation("Cognate acoustic analysis")}</Dropdown.Item>
        <Dropdown.Item onClick={openCognateReconstructionModal}>{getTranslation("Cognate reconstruction")}</Dropdown.Item>
        <Dropdown.Item onClick={openPhonemicAnalysisModal}>{getTranslation("Phonemic analysis")}</Dropdown.Item>
        <Dropdown.Item onClick={openPhonologyModal}>{getTranslation("Phonology")}</Dropdown.Item>
        <Dropdown.Item onClick={openPhonologicalStatisticalDistanceModal}>{getTranslation("Phonological statistical distance")}</Dropdown.Item>
        <Dropdown.Item onClick={soundAndMarkup}>{getTranslation("Sound and markup")}</Dropdown.Item>
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
      window.logger.suc(getTranslation('Sound and markup compilation is being created. Check out tasks for details.'));
    },
    () => {
      window.logger.err(getTranslation('Failed to launch sound and markup compilation!'));
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
    id, parent_id, mode, page, baseUrl,
  } = perspective.params;

  if (!baseUrl) return null;

  return (
    <Container fluid className="perspective inverted">
      <PerspectivePath id={id} dictionary_id={parent_id} mode={mode} />
      <ModeSelector
        mode={mode}
        id={id}
        baseUrl={baseUrl}
        filter={perspective.filter}
        submitFilter={submitFilter}
        openCognateAnalysisModal={() => openCognateAnalysisModal(id)}
        openCognateAcousticAnalysisModal={() => openCognateAnalysisModal(id, 'acoustic')}
        openCognateReconstructionModal={() => openCognateAnalysisModal(id, 'reconstruction')}
        openPhonemicAnalysisModal={() => openPhonemicAnalysisModal(id)}
        openPhonologyModal={() => openPhonologyModal(id)}
        openPhonologicalStatisticalDistanceModal={() => openPhonologyModal(id, 'statistical_distance')}
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
