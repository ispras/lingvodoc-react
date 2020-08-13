import React from 'react';
import PropTypes from 'prop-types';
import { getTranslation } from 'api/i18n';
import { fromJS, Map } from 'immutable';
import { Container, Segment, Label } from 'semantic-ui-react';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import BackTopButton from 'components/BackTopButton';
import AllDicts from 'pages/Home/components/AllDicts';
import { getScrollContainer } from 'pages/Home/common';
import 'pages/Home/published.scss';


const selectorDict = (props) => {
  const {
    dictWithPersp: {
      perspectives,
      language_tree: languages,
      is_authenticated: isAuthenticated,
      dictionaries,
    },
    mainDictionary,
    languagesGroup
  } = props;

  const localDictionaries = dictionaries;
  const languagesTree = buildLanguageTree(fromJS(languages));

  const dictsSource = fromJS(dictionaries);
  const localDicts = fromJS(localDictionaries);
  const isDownloaded = dict => !!localDicts.find(d => d.get('id').equals(dict.get('id')));


  const dicts = dictsSource.reduce(
    (acc, dict) => acc.set(dict.get('id'), dict.set('isDownloaded', isDownloaded(dict))),
    new Map()
  );

  const perspectivesList = fromJS(perspectives).map(perspective =>
    fromJS({
      ...perspective.toJS()
    }));


  const scrollContainer = getScrollContainer();

  return (
    <Container className="published">
      <Label size="huge"> {getTranslation('Select a dictionary for analysis')}</Label>)
      <Segment>
        <AllDicts
          languagesTree={languagesTree}
          dictionaries={dicts}
          isAuthenticated={isAuthenticated}
          perspectives={perspectivesList}
          selectorMode
          selectedDict={mainDictionary}
          languagesGroup={languagesGroup}
          statusLangsNav={false}
        />
      </Segment>
      <BackTopButton scrollContainer={scrollContainer} />
    </Container>
  );
};


selectorDict.propTypes = {
  mainDictionary: PropTypes.func.isRequired,
  languagesGroup: PropTypes.func.isRequired,
  dictWithPersp: PropTypes.shape({
    perspectives: PropTypes.array,
    language_tree: PropTypes.array,
    is_authenticated: PropTypes.bool,
    dictionaries: PropTypes.array,
  }).isRequired
};

export default selectorDict;
