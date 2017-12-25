import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Redirect, matchPath } from 'react-router-dom';
import { graphql, gql } from 'react-apollo';
import Immutable, { fromJS, Map } from 'immutable';
import { Container, Checkbox, Segment, Button, Message } from 'semantic-ui-react';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import { setGrantsMode } from 'ducks/home';

import config from 'config';

import GrantedDicts from './GrantedDicts';
import AllDicts from './AllDicts';
import './published.scss';

const dictionaryWithPerspectivesQuery = gql`
  query DictionaryWithPerspectives {
    dictionaries(proxy: false, published: true) {
      id
      parent_id
      translation
      status
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
    remoteDictionaries: dictionaries(proxy: true) {
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
    grants {
      id
      translation
      issuer
      grant_number
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
    is_authenticated
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
    grantsMode,
    selected,
    actions,
    downloadDictionaries,
    data: {
      loading,
      error,
      dictionaries,
      perspectives,
      grants,
      language_tree: languages,
      remoteDictionaries,
      is_authenticated: isAuthenticated,
      permission_lists: permissionLists,
    },
    location: { hash },
  } = props;

  if (error || loading) {
    return null;
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

  // server version
  let dictsSource;
  // proxy/desktop version
  if (config.buildType === 'desktop' || config.buildType === 'proxy') {
    dictsSource = isAuthenticated ? fromJS(remoteDictionaries) : fromJS(dictionaries);
  } else {
    dictsSource = fromJS(dictionaries);
  }

  // pre-process dictionary list
  const isDownloaded = dict => !!dictsSource.find(d => d.get('id').equals(dict.get('id')));
  const hasPermission = (p, permission) =>
    (config.buildType === 'server' ? false : permissions.get(permission).has(p.get('id')));

  const dicts = dictsSource.reduce(
    (acc, dict) =>
      acc.set(
        dict.get('id'),
        dict.set('isDownloaded', isDownloaded(dict)).set('selected', selected.has(dict.get('id')))
      ),
    new Map()
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

  const sortMode = grantsMode ? 'by grants' : 'by languages';

  function download() {
    const ids = selected.toJS();
    downloadDictionaries({
      variables: { ids },
    });
  }

  return (
    <Container className="published">
      <Message padded="very" warning>
        <b>
          Редакторам рекомендуется использовать старую версию системы по адресу:{' '}
          <a href="http://old.lingvodoc.at.ispras.ru">http://old.lingvodoc.at.ispras.ru</a>
        </b>
      </Message>
      <Segment padded="very">
        <b style={{ fontSize: '1.2em' }}>Display mode </b>
        <Checkbox
          toggle
          label={{ children: <div className="toggle-label">{sortMode}</div> }}
          defaultChecked={grantsMode}
          onChange={(e, v) => actions.setGrantsMode(v.checked)}
        />

        {(config.buildType === 'desktop' || config.buildType === 'proxy') && (
          <Button positive onClick={download} disabled={selected.size === 0}>
            {selected.size > 0 && <p>Download ({selected.size})</p>}
            {selected.size === 0 && <p>Download</p>}
          </Button>
        )}
      </Segment>
      {grantsMode && (
        <GrantedDicts
          languagesTree={languagesTree}
          dictionaries={dicts}
          perspectives={perspectivesList}
          grants={grantsList}
          selected={selected}
        />
      )}
      {!grantsMode && <AllDicts languagesTree={languagesTree} dictionaries={dicts} perspectives={perspectivesList} />}
    </Container>
  );
};

Home.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  grantsMode: PropTypes.bool.isRequired,
  selected: PropTypes.instanceOf(Immutable.Set).isRequired,
  actions: PropTypes.shape({
    setGrantsMode: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.object.isRequired,
  downloadDictionaries: PropTypes.func.isRequired,
};

export default compose(
  connect(
    state => ({ ...state.home, ...state.router }),
    dispatch => ({ actions: bindActionCreators({ setGrantsMode }, dispatch) })
  ),
  graphql(dictionaryWithPerspectivesQuery),
  graphql(downloadDictionariesMutation, { name: 'downloadDictionaries' })
)(Home);
