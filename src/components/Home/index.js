import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, branch, renderNothing } from 'recompose';
import { Redirect, matchPath } from 'react-router-dom';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Immutable, { fromJS, Map, OrderedMap } from 'immutable';
import { Container, Form, Radio, Segment, Button, Label } from 'semantic-ui-react';

import { buildLanguageTree } from 'pages/Search/treeBuilder';
import { setSortMode, resetDictionaries } from 'ducks/home';

import config from 'config';

import BackTopButton from 'components/BackTopButton';
import { getTranslation } from 'api/i18n';
import Placeholder from 'components/Placeholder';
import GrantedDicts from './components/GrantedDicts';
import AllDicts from './components/AllDicts';
import { getScrollContainer } from './common';
import './published.scss';

const authenticatedDictionariesQuery = gql`
  query AuthDictionaries {
    dictionaries(proxy: true,category:0) {
      id
      parent_id
      translation
      status
      category
      additional_metadata {
        authors
      }
      perspectives {
        id
        translation
      }
    }
    permission_lists(proxy: true) {
      view {
        id
        parent_id
        translation
      }
      edit {
        id
        parent_id
        translation
      }
      publish {
        id
        parent_id
        translation
      }
      limited {
        id
        parent_id
        translation
      }
    }
  }
`;

const guestDictionariesQuery = gql`
  query GuestDictionaries {
    dictionaries(proxy: false, published: true,category:0) {
      id
      parent_id
      translation
      status
      category
      additional_metadata {
        authors
      }
      perspectives {
        id
        translation
      }
    }
    permission_lists(proxy: false) {
      view {
        id
        parent_id
        translation
      }
      edit {
        id
        parent_id
        translation
      }
      publish {
        id
        parent_id
        translation
      }
      limited {
        id
        parent_id
        translation
      }
    }
  }
`;

const downloadDictionariesMutation = gql`
  mutation DownloadDictionaries($ids: [LingvodocID]!) {
    download_dictionaries(ids: $ids) {
      triumph
    }
  }
`;

const Home = (props) => {
  const {
    sortMode,
    selected,
    actions,
    downloadDictionaries,
    dictionaries: localDictionaries,
    perspectives,
    grants,
    organizations,
    languages,
    isAuthenticated,
    data: {
      loading, error, dictionaries, permission_lists: permissionLists,
    },
    location: { hash },
  } = props;

  if (error) {
    return null;
  }

  if (loading) {
    return (
      <Placeholder />
    );
  }

  // handle legacy links from Lingvodoc 2.0
  // if link has hash like #/dictionary/1/2/perspective/3/4/edit redirect to this version's
  // PerspectiveView page
  if (hash) {
    const match = matchPath(hash, {
      path: '#/dictionary/:pcid/:poid/perspective/:cid/:oid/:mode',
    });
    if (match) {
      const {
        pcid, poid, cid, oid, mode,
      } = match.params;
      return <Redirect to={`/dictionary/${pcid}/${poid}/perspective/${cid}/${oid}/${mode}`} />;
    }
  }

  const grantsList = fromJS(grants);
  const organizationsList = fromJS(organizations);
  const languagesTree = buildLanguageTree(fromJS(languages));

  // skip permissions if buildType == 'server'
  const permissions =
    config.buildType === 'server'
      ? null
      : fromJS({
        view: permissionLists.view,
        edit: permissionLists.edit,
        publish: permissionLists.publish,
        limited: permissionLists.limited,
      }).map(ps => new Immutable.Set(ps.map(p => p.get('id'))));

  const dictsSource = fromJS(dictionaries);

  // pre-process dictionary list
  const localDicts = fromJS(localDictionaries);
  const isDownloaded = dict => !!localDicts.find(d => d.get('id').equals(dict.get('id')));
  const hasPermission = (p, permission) =>
    (config.buildType === 'server' ? false : permissions.get(permission).has(p.get('id')));

  /* Ordered map for preservation of server dictionary order, which is by creation time from new to old. */

  const dicts = dictsSource.reduce(
    (acc, dict) => acc.set(dict.get('id'), dict.set('isDownloaded', isDownloaded(dict))),
    new OrderedMap()
  );

  const perspectivesList = fromJS(perspectives).map(perspective =>
    // for every perspective set 4 boolean property: edit, view, publish, limited
    // according to permission_list result
    fromJS({
      ...perspective.toJS(),
      view: hasPermission(perspective, 'view'),
      edit: hasPermission(perspective, 'edit'),
      publish: hasPermission(perspective, 'publish'),
      limited: hasPermission(perspective, 'limited'),
    }));

  function download() {
    const ids = selected.toJS();
    downloadDictionaries({
      variables: { ids },
    }).then(() => {
      actions.resetDictionaries();
    });
  }

  const scrollContainer = getScrollContainer();

  return (
    <Container className="published">
      <Segment className="rose_background!!!!!!!!!!!!!!!">
        <Form>
          <Form.Group inline className="toggle-label">
            <label>{getTranslation('Display mode')}</label>
            <Segment>
              <Form.Field
                control={Radio}
                label={{ children: <div className="toggle-label">{getTranslation('By Languages')}</div> }}
                value="1"
                checked={!sortMode}
                onChange={() => actions.setSortMode(null)}
              />
              <Form.Field
                control={Radio}
                label={{ children: <div className="toggle-label">{getTranslation('By Grants')}</div> }}
                value="2"
                checked={sortMode == 'grant'}
                onChange={() => actions.setSortMode('grant')}
              />
              <Form.Field
                control={Radio}
                label={{ children: <div className="toggle-label">{getTranslation('By Organizations')}</div> }}
                value="3"
                checked={sortMode == 'organization'}
                onChange={() => actions.setSortMode('organization')}
              />
            </Segment>
          </Form.Group>
        </Form>

        {isAuthenticated &&
          (config.buildType === 'desktop' || config.buildType === 'proxy') && (
            <Button positive onClick={download} disabled={selected.size === 0}>
              {selected.size > 0 && <p>Download ({selected.size})</p>}
              {selected.size === 0 && <p>Download</p>}
            </Button>
          )}
      </Segment>
      <Segment>
        {sortMode == 'grant' && (
          <GrantedDicts
            mode='grant'
            languagesTree={languagesTree}
            dictionaries={dicts}
            perspectives={perspectivesList}
            grants={grantsList}
            isAuthenticated={isAuthenticated}
          />
        )}
        {sortMode == 'organization' && (
          <GrantedDicts
            mode='organization'
            languagesTree={languagesTree}
            dictionaries={dicts}
            perspectives={perspectivesList}
            grants={organizationsList}
            isAuthenticated={isAuthenticated}
          />
        )}
        {!sortMode && (
          <AllDicts
            location={props.location}
            languagesTree={languagesTree}
            dictionaries={dicts}
            perspectives={perspectivesList}
            isAuthenticated={isAuthenticated}
            selectorMode={false}
          />
        )}
      </Segment>
      <BackTopButton scrollContainer={scrollContainer} />
    </Container>
  );
};

Home.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  dictionaries: PropTypes.array,
  perspectives: PropTypes.array.isRequired,
  grants: PropTypes.array.isRequired,
  languages: PropTypes.array.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  selected: PropTypes.instanceOf(Immutable.Set).isRequired,
  actions: PropTypes.shape({
    setSortMode: PropTypes.func.isRequired,
    resetDictionaries: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.object.isRequired,
  downloadDictionaries: PropTypes.func.isRequired,
};

Home.defaultProps = {
  dictionaries: [],
};

const dictionaryWithPerspectivesQuery = gql`
  query DictionaryWithPerspectives {
    perspectives {
      id
      parent_id
      translation
    }
    grants {
      id
      translation
      issuer
      grant_number
      additional_metadata {
        participant
      }
    }
    organizations {
      id
      translation
      additional_metadata {
        participant
      }
    }
    language_tree {
      id
      parent_id
      translation
      created_at
    }
    is_authenticated
  }
`;

const dictionaryWithPerspectivesProxyQuery = gql`
  query DictionaryWithPerspectivesProxy {
    dictionaries(proxy: false, published: true,category:0) {
      id
      parent_id
      translation
      additional_metadata {
        authors
      }
      perspectives {
        id
        translation
      }
    }
    perspectives {
      id
      parent_id
      translation
    }
    grants {
      id
      translation
      issuer
      grant_number
      additional_metadata {
        participant
      }
    }
    organizations {
      id
      translation
      additional_metadata {
        participant
      }
    }
    language_tree {
      id
      parent_id
      translation
      created_at
    }
    is_authenticated
  }
`;

const AuthWrapper = ({
  data: {
    perspectives, grants, organizations, language_tree: languages, is_authenticated: isAuthenticated, dictionaries,
  },
}) => {
  const Component = compose(
    connect(
      state => ({ ...state.home, ...state.router }),
      dispatch => ({ actions: bindActionCreators({ setSortMode, resetDictionaries }, dispatch) })
    ),
    graphql(isAuthenticated ? authenticatedDictionariesQuery : guestDictionariesQuery, {
      options: {
        fetchPolicy: 'network-only'
      }
    }),
    graphql(downloadDictionariesMutation, { name: 'downloadDictionaries' })
  )(Home);

  if (config.buildType === 'server') {
    return (
      <Component
        perspectives={perspectives}
        grants={grants}
        organizations={organizations}
        languages={languages}
        isAuthenticated={isAuthenticated} />
    );
  }
  // proxy and desktop has additional parameter - local dictionaries
  return (
    <Component
      dictionaries={dictionaries}
      perspectives={perspectives}
      grants={grants}
      organizations={organizations}
      languages={languages}
      isAuthenticated={isAuthenticated}
    />
  );
};

AuthWrapper.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    perspectives: PropTypes.array,
    grants: PropTypes.array,
    language_tree: PropTypes.array,
    is_authenticated: PropTypes.bool,
  }).isRequired,
};

export default compose(
  graphql(config.buildType === 'server' ? dictionaryWithPerspectivesQuery : dictionaryWithPerspectivesProxyQuery),
  branch(({ data }) => data.loading || data.error, renderNothing)
)(AuthWrapper);
