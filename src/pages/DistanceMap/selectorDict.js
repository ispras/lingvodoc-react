import React from 'react';
import PropTypes from 'prop-types';

import gql from 'graphql-tag';
import Immutable, { fromJS, Map } from 'immutable';
import { Container, Form, Radio, Segment, Button } from 'semantic-ui-react';

import { buildLanguageTree } from 'pages/Search/treeBuilder';


import config from 'config';

import BackTopButton from 'components/BackTopButton';
import AllDicts from 'pages/Home/components/AllDicts';
import Placeholder from 'components/Placeholder';
import { getScrollContainer } from 'pages/Home/common';

import 'pages/Home/published.scss';


const Home = (props) => {
  const {
    dictWithPersp: {
      perspectives,
      grants,
      language_tree: languages,
      is_authenticated: isAuthenticated,
      dictionaries,
    },
    mainDictionary,
    languagesGroup
  } = props;
  const localDictionaries = dictionaries;


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

  const dicts = dictsSource.reduce(
    (acc, dict) => acc.set(dict.get('id'), dict.set('isDownloaded', isDownloaded(dict))),
    new Map()
  );

  const perspectivesList = fromJS(perspectives).map(perspective =>
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
      <Segment>
        <AllDicts
          languagesTree={languagesTree}
          dictionaries={dicts}
          isAuthenticated={isAuthenticated}
          perspectives={perspectivesList}
          selectorMode
          selectedDict={mainDictionary}
          languagesGroup={languagesGroup}
        />
      </Segment>
      <BackTopButton scrollContainer={scrollContainer} />
    </Container>
  );
};


export default (Home);
