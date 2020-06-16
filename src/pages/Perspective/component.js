import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
      id
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

const toolsQuery = gql`
  query tools($id: LingvodocID!) {
    perspective(id: $id) {
      id
      english_status: status(locale_id: 2)
    }
  }
`;

const Tools = graphql(toolsQuery)(({
  data,
  openCognateAnalysisModal,
  openPhonemicAnalysisModal,
  openPhonologyModal,
  launchSoundAndMarkup,
  id,
  mode }) =>
{
  if (data.loading || data.error) {
    return null;
  }

  const { perspective: { english_status } } = data;

  const published =
    english_status == 'Published' ||
    english_status == 'Limited access';

  return (
    <Dropdown item text={getTranslation("Tools")}>
      <Dropdown.Menu>

        <Dropdown.Item
          onClick={() => openCognateAnalysisModal(id, 'acoustic')}>
          {getTranslation("Cognate acoustic analysis")}
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => openCognateAnalysisModal(id)}>
          {getTranslation("Cognate analysis")}
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => openCognateAnalysisModal(id, 'multi_reconstruction')}>
          {getTranslation("Cognate multi-language reconstruction")}
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => openCognateAnalysisModal(id, 'multi_suggestions')}
          disabled={!published}>
          {getTranslation(published ?
            "Cognate multi-language suggestions" :
            "Cognate multi-language suggestions (disabled, perspective is not published)")}
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => openCognateAnalysisModal(id, 'reconstruction')}>
          {getTranslation("Cognate reconstruction")}
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => openCognateAnalysisModal(id, 'suggestions')}
          disabled={!published}>
          {getTranslation(published ?
            "Cognate suggestions" :
            "Cognate suggestions (disabled, perspective is not published)")}
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => openPhonemicAnalysisModal(id)}>
          {getTranslation("Phonemic analysis")}
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => openPhonologyModal(id)}>
          {getTranslation("Phonology")}
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => openPhonologyModal(id, 'statistical_distance')}>
          {getTranslation("Phonological statistical distance")}
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => soundAndMarkup(id, mode, launchSoundAndMarkup)}>
          {getTranslation("Sound and markup")}
        </Dropdown.Item>

      </Dropdown.Menu>
    </Dropdown>
  );
});

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

const ModeSelector = compose(
  connect(state => state.user),
  onlyUpdateForKeys([ 'mode', 'baseUrl', 'filter', 'user' ])
)(({
  mode,
  baseUrl,
  filter,
  submitFilter,
  openCognateAnalysisModal,
  openPhonemicAnalysisModal,
  openPhonologyModal,
  launchSoundAndMarkup,
  id,
  user
}) => {
  const modes = {};
  if (user.id !== undefined) {
    Object.assign(modes, {
      edit: {
        entitiesMode: 'all',
        text: getTranslation('Edit'),
        component: PerspectiveView,
      },
      publish: {
        entitiesMode: 'all',
        text: getTranslation('Publish'),
        component: PerspectiveView,
      }
    });
  }
  Object.assign(modes, {
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
    }
  });

  return (
    <Menu tabular>
      { map(modes, (info, stub) =>
        <Menu.Item key={stub} as={Link} to={`${baseUrl}/${stub}`} active={mode === stub}>
          {info.text}
          {info.component === PerspectiveView ? <Counter id={id} mode={info.entitiesMode}/> : null}
        </Menu.Item>
      )}
      <Tools
        id={id}
        mode={mode}
        openCognateAnalysisModal={openCognateAnalysisModal}
        openPhonemicAnalysisModal={openPhonemicAnalysisModal}
        openPhonologyModal={openPhonologyModal}
        launchSoundAndMarkup={launchSoundAndMarkup}
      />
      <Menu.Menu position="right">
        <Filter filter={filter} submitFilter={submitFilter} />
      </Menu.Menu>
    </Menu>
  );});

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
  user
}) => {
  const { id, parent_id, mode, page, baseUrl } = perspective.params;
  if (!baseUrl) {
    return null;
  }

  const modes = {};
  if (user.id !== undefined) {
    Object.assign(modes, {
      edit: {
        entitiesMode: 'all',
        text: getTranslation('Edit'),
        component: PerspectiveView,
      },
      publish: {
        entitiesMode: 'all',
        text: getTranslation('Publish'),
        component: PerspectiveView,
      }
    });
  }
  Object.assign(modes, {
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
    }
  });

  return (
    <Container fluid className="perspective inverted">
      <PerspectivePath id={id} dictionary_id={parent_id} mode={mode} />
      <ModeSelector
        mode={mode}
        id={id}
        baseUrl={baseUrl}
        filter={perspective.filter}
        submitFilter={submitFilter}
        openCognateAnalysisModal={openCognateAnalysisModal}
        openPhonemicAnalysisModal={openPhonemicAnalysisModal}
        openPhonologyModal={openPhonologyModal}
        launchSoundAndMarkup={launchSoundAndMarkup}
      />
      <Switch>
        <Redirect exact from={baseUrl} to={`${baseUrl}/view`} />
        { map(modes, (info, stub) => (
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

export default compose(
  connect(state => state.user),
  graphql(launchSoundAndMarkupMutation, { name: 'launchSoundAndMarkup' })
)(Perspective);
