import React from 'react';
import PropTypes from 'prop-types';
import { getTranslation } from 'api/i18n';
import { fromJS, Map } from 'immutable';
import { Container, Segment, Label } from 'semantic-ui-react';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import BackTopButton from 'components/BackTopButton';
import AllDicts from 'components/Home/components/AllDicts';
import { getScrollContainer } from 'components/Home/common';
import 'components/Home/published.scss';


const selectorDict = (props) => {
  const {
    languageTree: languages,
    dictionaries,
    perspectives,
    isAuthenticated
  } = props;

  const localDictionaries = dictionaries;
  const languagesTree = buildLanguageTree(fromJS(languages));

  if (languagesTree.size <= 0) { return null; }

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
      <Segment size="huge"> {getTranslation('Select a dictionary for analysis')}</Segment>
      <Segment>
        <AllDicts
          languagesTree={languagesTree}
          dictionaries={dicts}
          dictionariesAll={dictionaries}
          isAuthenticated={isAuthenticated}
          perspectives={perspectivesList}
          selectorMode
          statusLangsNav={false}
        />
      </Segment>
      { (scrollContainer) && (<BackTopButton scrollContainer={scrollContainer} />)}
    </Container>
  );
};

selectorDict.defaultProps = {
  isAuthenticated: false
};
selectorDict.propTypes = {
  perspectives: PropTypes.array.isRequired,
  languageTree: PropTypes.array.isRequired,
  isAuthenticated: PropTypes.bool,
  dictionaries: PropTypes.array.isRequired,

};

export default selectorDict;
