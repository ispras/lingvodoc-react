import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
// import { map } from 'lodash';
import { onlyUpdateForKeys, withHandlers, withState, compose } from 'recompose';
// import { Switch, Route, Redirect, Link } from 'react-router-dom';
import { Container, Menu, Dropdown } from 'semantic-ui-react';
import PerspectiveView from './PerspectiveView';
// import NotFound from 'pages/NotFound';
import { getTranslation } from 'api/i18n';
import PerspectivePath from '../../pages/Perspective/PerspectivePath';

import '../../pages/Perspective/style.scss';

export const launchSoundAndMarkupMutation = gql`
  mutation launchSoundAndMarkup(
    $perspectiveId: LingvodocID!,
    $publishedMode: String!) {
      sound_and_markup(
        perspective_id: $perspectiveId,
        published_mode: $publishedMode)
      { triumph } }
`;

// const queryCounter = gql`
//   query qcounter($id: LingvodocID! $mode: String!) {
//     perspective(id: $id) {
//       counter(mode: $mode)
//     }
//   }
// `;

// const queryCounter = gql`
//   query qcounter($id: LingvodocID!, $entriesIds: [LingvodocID]!, $mode: String!) {
//     perspective(id: $id) {
//       id
//       lexical_entries(ids: $entriesIds, mode: $mode) {
//         id
//       }
//     }
//   }
// `;

// const Counter = graphql(queryCounter)(({ data }) => {
//   if (data.loading || data.error) {
//     return null;
//   }
//   const { perspective: { lexical_entries: lexicalEntries } } = data;
//   return ` (${lexicalEntries.length})`;
// });

const Counter = ({ entriesIds }) => ` (${entriesIds.length})`;

const MODES = {
  edit: {
    entitiesMode: 'all',
    text: getTranslation('Edit'),
  },
  view: {
    entitiesMode: 'published',
    text: getTranslation('View published'),
  },
  publish: {
    entitiesMode: 'all',
    text: getTranslation('Publish'),
  }
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
    <form className="ui icon input" onSubmit={onSubmit}>
      <input type="text" placeholder={getTranslation('Filter')} value={value} onChange={onChange} />
      <button type="submit">
        <i className="search link icon" />
      </button>
    </form>
  </div>
));

const ModeSelector = onlyUpdateForKeys([
  'mode',
  'filter',
])(({
  mode, filter,
  submitFilter,
  openCognateAnalysisModal,
  openCognateAcousticAnalysisModal,
  openPhonemicAnalysisModal,
  openPhonologyModal,
  soundAndMarkup,
  toggleMode,
  id,
  entriesIds,
}) => (
  <Menu tabular>
    <Menu.Item active={mode === 'view'} onClick={toggleMode('view')}>
      {MODES.view.text}
      <Counter
        id={id}
        mode={MODES.view.entitiesMode}
        entriesIds={entriesIds}
      />
    </Menu.Item>
    <Menu.Item active={mode === 'edit'} onClick={toggleMode('edit')}>
      {MODES.edit.text}
      <Counter
        id={id}
        mode={MODES.edit.entitiesMode}
        entriesIds={entriesIds}
      />
    </Menu.Item>
    <Menu.Item active={mode === 'publish'} onClick={toggleMode('publish')}>
      {MODES.publish.text}
      <Counter
        id={id}
        mode={MODES.publish.entitiesMode}
        entriesIds={entriesIds}
      />
    </Menu.Item>
    {/* <Dropdown item text={getTranslation('Tools')}>
      <Dropdown.Menu>
        <Dropdown.Item onClick={openCognateAnalysisModal}>{getTranslation('Cognate analysis')}</Dropdown.Item>
        <Dropdown.Item onClick={openCognateAcousticAnalysisModal}>
          {getTranslation('Cognate acoustic analysis')}
        </Dropdown.Item>
        <Dropdown.Item onClick={openPhonemicAnalysisModal}>{getTranslation('Phonemic analysis')}</Dropdown.Item>
        <Dropdown.Item onClick={openPhonologyModal}>{getTranslation('Phonology')}</Dropdown.Item>
        <Dropdown.Item onClick={soundAndMarkup}>{getTranslation('Sound and markup')}</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown> */}

    <Menu.Menu position="right">
      <Filter filter={filter} submitFilter={submitFilter} />
    </Menu.Menu>
  </Menu>
));

const soundAndMarkup = (perspectiveId, mode, launchSoundAndMarkup) => {
  launchSoundAndMarkup({
    variables: {
      perspectiveId,
      publishedMode: mode === 'edit' ? 'all' : 'published',
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

class Perspective extends PureComponent {
  constructor(props) {
    super();

    const { defaultMode } = props;

    this.state = {
      mode: defaultMode,
      page: 1,
    };

    this.toggleMode = this.toggleMode.bind(this);
    this.changePage = this.changePage.bind(this);
  }

  toggleMode(mode) {
    return () => {
      this.setState({
        mode,
      });
    };
  }

  changePage(page) {
    return () => {
      this.setState({
        page,
      });
    };
  }

  render() {
    const {
      perspective,
      entriesIds,
      submitFilter,
      openCognateAnalysisModal,
      openPhonemicAnalysisModal,
      openPhonologyModal,
      launchSoundAndMarkup,
    } = this.props;
    const {
      id, parent_id: parentId,
    } = perspective.params;

    if (!id || !parentId) return null;

    const { mode, page } = this.state;
    const { entitiesMode } = MODES[mode];
    return (
      <Container fluid className="perspective search-perspective-view">
        <PerspectivePath id={id} dictionary_id={parentId} mode={mode} className="normal" />
        <ModeSelector
          mode={mode}
          id={id}
          entriesIds={entriesIds}
          filter={perspective.filter}
          submitFilter={submitFilter}
          openCognateAnalysisModal={() => openCognateAnalysisModal(id)}
          openCognateAcousticAnalysisModal={() => openCognateAnalysisModal(id, 'acoustic')}
          openPhonemicAnalysisModal={() => openPhonemicAnalysisModal(id)}
          openPhonologyModal={() => openPhonologyModal(id)}
          soundAndMarkup={() => soundAndMarkup(id, mode, launchSoundAndMarkup)}
          toggleMode={this.toggleMode}
        />
        <PerspectiveView
          id={id}
          mode={mode}
          entitiesMode={entitiesMode}
          entriesIds={entriesIds}
          page={page}
          filter={perspective.filter}
          className="content"
          changePage={this.changePage}
        />
      </Container>
    );
  }
}

// const Perspective = ({
//   perspective,
//   submitFilter,
//   openCognateAnalysisModal,
//   openPhonemicAnalysisModal,
//   openPhonologyModal,
//   launchSoundAndMarkup,
// }) => {
//   const {
//     id, parent_id: parentId,
//   } = perspective.params;

//   if (!id || !parentId) return null;

//   const mode = 'edit';
//   const page = 1;

//   return (
//     <Container fluid className="perspective inverted">
//       <PerspectivePath id={id} dictionary_id={parentId} mode={mode} />
//       <ModeSelector
//         mode={mode}
//         id={id}
//         filter={perspective.filter}
//         submitFilter={submitFilter}
//         openCognateAnalysisModal={() => openCognateAnalysisModal(id)}
//         openCognateAcousticAnalysisModal={() => openCognateAnalysisModal(id, 'acoustic')}
//         openPhonemicAnalysisModal={() => openPhonemicAnalysisModal(id)}
//         openPhonologyModal={() => openPhonologyModal(id)}
//         soundAndMarkup={() => soundAndMarkup(id, mode, launchSoundAndMarkup)}
//       />
//       <Switch>
//         <Redirect exact from={baseUrl} to={`${baseUrl}/view`} />
//         {map(MODES, (info, stub) => (
//           <Route
//             key={stub}
//             path={`${baseUrl}/${stub}`}
//             render={() => (
//               <info.component
//                 id={id}
//                 mode={mode}
//                 entitiesMode={info.entitiesMode}
//                 page={page}
//                 filter={perspective.filter}
//                 className="content"
//               />
//             )}
//           />
//         ))}
//         <Route component={NotFound} />
//       </Switch>

//       <PerspectiveView
//         id={id}
//         mode={mode}
//         entitiesMode="all"
//         page={page}
//         filter={perspective.filter}
//         className="content"
//       />
//     </Container>
//   );
// };

Perspective.propTypes = {
  perspective: PropTypes.object.isRequired,
  defaultMode: PropTypes.string.isRequired,
  entriesIds: PropTypes.array.isRequired,
  submitFilter: PropTypes.func.isRequired,
  openCognateAnalysisModal: PropTypes.func.isRequired,
  openPhonemicAnalysisModal: PropTypes.func.isRequired,
  openPhonologyModal: PropTypes.func.isRequired,
  launchSoundAndMarkup: PropTypes.func.isRequired,
};

export default
graphql(launchSoundAndMarkupMutation, { name: 'launchSoundAndMarkup' })(Perspective);
