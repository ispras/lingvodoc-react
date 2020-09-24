import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Label, Checkbox, Segment, Button } from 'semantic-ui-react';
import { compose } from 'recompose';
import Immutable, { fromJS } from 'immutable';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import { getTranslation } from 'api/i18n';
import { compositeIdToString as id2str } from 'utils/compositeId';
import { Link } from 'react-router-dom';
import checkLexicalEntries from './checkLexicalEntries';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setLanguagesGroup } from 'ducks/distanceMap';

const dictionaryName = gql`
query dictionaryName($id:LingvodocID) {
  dictionary(id:$id){
    id
    translation
    perspectives {
      columns{
        field_id
      }
    }
  }
}`;

function selectorLangGroup(props) {
  const {
    client, location, actions,
  } = props;
  let { arrDictionariesGroup } = props;
  const {
    allDictionaries,
    allLanguages,
    languagesGroup,
    mainDictionary,
    allField
  } = location.state;

  const parentId = mainDictionary[0].parent_id;
  const [labelDict, setLabelDict] = useState(null);
  const [nodeLanguages, setNodeLanguages] = useState([]);
  const [childLanguages, setChildLanguages] = useState([]);
  const [twoChildLanguages, setTwoChildLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState([]);
  const [focusNodeLanguages, setFocusNodeLanguages] = useState('');
  const [focusChildLanguages, setFocusChildLanguages] = useState('');
  const [focusTwoChildLanguages, setFocusTwoChildLanguages] = useState('');

  const dictionaryWithLexicalEntries = [];
  let rootLanguage = {};
  let mainDict = [];


  client.query({
    query: dictionaryName,
    variables: { id: parentId },
  }).then(result => setLabelDict(result.data.dictionary.translation));

  languagesGroup.forEach((language) => {
    language.children.forEach((children) => {
      children.perspectives.forEach((perspective) => {
        if (id2str(perspective.id) === id2str(mainDictionary[0].id)) {
          rootLanguage = language;
          mainDict = children;
        }
      });
    });
  });


  const filterDictionary = (dict, checked) => {
    if (checked) {
      arrDictionariesGroup.push(dict);
    } else {
      arrDictionariesGroup = arrDictionariesGroup.filter(element => id2str(element.id) !== id2str(dict.id));
    }
  };
  function dictionariesSelectedLanguges(lang) {
    setSelectedLanguage(lang);
    const arrDictionary = [];

    allDictionaries.forEach((dict) => {
      if ((id2str(dict.parent_id) === id2str(lang.id)) && dict.perspectives[1] && dict.perspectives[0]) {
        if (checkLexicalEntries(dict.perspectives[0].translation) || checkLexicalEntries(dict.perspectives[1].translation)) {
          arrDictionary.push(dict);
        }
      }
    });

    setSelectedLanguage(arrDictionary);
  }
  function addLanguages() {
    if (nodeLanguages.length === 0) {
      setNodeLanguages(allLanguages);
    }
  }

  function selectNodeLanguage(language) {
    setSelectedLanguage([]);
    setTwoChildLanguages([]);
    const languageChildren = language.children;
    if (languageChildren.length !== 0) {
      return setChildLanguages(languageChildren);
    }
    return dictionariesSelectedLanguges(language);
  }

  function selectChildLanguage(language) {
    const languageChildren = language.children;
    setSelectedLanguage([]);
    setTwoChildLanguages([]);
    if (languageChildren.length !== 0) {
      return setTwoChildLanguages(languageChildren);
    }
    return dictionariesSelectedLanguges(language);
  }


  rootLanguage.children.forEach((dict) => {
    if (dict.translation !== mainDict.translation && dict.additional_metadata.location !== null) {
      dict.perspectives.forEach((perspective) => {
        if (checkLexicalEntries(perspective.translation)) {
          dictionaryWithLexicalEntries.push(dict);
        }
      });
    }
  });

  return (
    <div>
      <Label size="massive" >{labelDict}</Label>
      <Segment.Group>
        {dictionaryWithLexicalEntries.map(dict =>
          (dictionaryWithLexicalEntries.length !== 0) &&
          (
            <Segment key={dict.id}>
              <Checkbox
                defaultChecked={arrDictionariesGroup.some(element => id2str(element.id) === id2str(dict.id))}
                onChange={(event, { checked }) => { filterDictionary(dict, checked); }}
                label={dict.translation}
              />
            </Segment>
          ))}
        {(dictionaryWithLexicalEntries.length === 0) && (
          <Segment>
            {getTranslation('No analysis dictionaries found')}
          </Segment>
        )}
      </Segment.Group>
      <Segment.Group>
        {(nodeLanguages.length === 0) && (<Button onClick={addLanguages}>{getTranslation('Add dictionaries of other language groups')}</Button>)}
        {(nodeLanguages.length !== 0) && (
          <Segment >
            {nodeLanguages.map(lang =>
              (lang.translation) && (
                <Button
                  active={focusNodeLanguages === lang.translation}
                  key={lang.id.join('_')}
                  onClick={() => {
                    setFocusNodeLanguages(lang.translation);
                    selectNodeLanguage(lang);
                  }}
                >
                  {lang.translation}
                </Button>))}
          </Segment>
        )}
        {(childLanguages.length !== 0) && (
          <Segment >
            {childLanguages.map(lang =>
              (lang.translation) && (
                <Button
                  active={focusChildLanguages === lang.translation}
                  key={lang.id.join('_')}
                  onClick={() => {
                    setFocusChildLanguages(lang.translation);
                    selectChildLanguage(lang);
                  }}
                >
                  {lang.translation}
                </Button>))}
          </Segment>
        )}
        {(twoChildLanguages.length !== 0) && (
          <Segment >
            {twoChildLanguages.map(lang =>
              <Button
                active={focusTwoChildLanguages === lang.translation}
                key={lang.id.join('_')}
                onClick={() => {
                  setFocusTwoChildLanguages(lang.translation);
                  dictionariesSelectedLanguges(lang);
                }}
              >
                {lang.translation}
              </Button>)}
          </Segment>
        )}
        {(selectedLanguage.length !== 0) && (
          selectedLanguage.map(dict =>
            (dict.additional_metadata.location !== null) && (
              <Segment key={dict.id.join('_')}>
                <Checkbox
                  defaultChecked={arrDictionariesGroup.some(element => id2str(element.id) === id2str(dict.id))}
                  onChange={(event, { checked }) => { filterDictionary(dict, checked); }}
                  label={dict.translation}
                />
              </Segment>

            ))
        )
        }
        {(selectedLanguage.length === 0) && (nodeLanguages.length !== 0) && (
          <Segment>
            <Label> {getTranslation('No matching dictionaries')}</Label>
          </Segment>
        )}
      </Segment.Group>
      <Button > {getTranslation('Next')} </Button>
      <Link to={{
          pathname: '/distance_map/test/test',
          state: {
            dictionaries: arrDictionariesGroup,
            mainDictionary: mainDict,
            rootLanguage,
            allField,
}
        }}
      >
        <Button onClick={() => actions.setLanguagesGroup({ arrDictionariesGroup })}> Ссылка </Button>
      </Link>


    </div >
  );
}

selectorLangGroup.propTypes = {
/*   mainGroup: PropTypes.func.isRequired,
  mainDictionary: PropTypes.instanceOf(Immutable.List).isRequired, */
  client: PropTypes.object.isRequired,
  /*   languagesGroup: PropTypes.array.isRequired,
  mainDictionaryFun: PropTypes.func.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired, */
  arrDictionariesGroup: PropTypes.array,
  location: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};
selectorLangGroup.defaultProps = {
  arrDictionariesGroup: []
};
/* export default compose(
  connect(state => ({ ...state.distanceMap })),
  withApollo
)(selectorLangGroup); */
/* export default compose(withApollo)(selectorLangGroup); */
export default compose(
  connect(
    state => ({ ...state.distanceMap })
    , dispatch => ({ actions: bindActionCreators({ setLanguagesGroup }, dispatch) })
  ),
  withApollo
)(selectorLangGroup);
