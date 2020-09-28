import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Label, Checkbox, Segment, Button } from 'semantic-ui-react';
import { compose } from 'recompose';
import Immutable, { fromJS } from 'immutable';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import { getTranslation } from 'api/i18n';
import { compositeIdToString as id2str } from 'utils/compositeId';
import { Link, Redirect } from 'react-router-dom';
import checkLexicalEntries from './checkLexicalEntries';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setLanguagesGroup, setDefaultGroup } from 'ducks/distanceMap';

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
    client, location, actions, languagesGroupState, history, dataForTree
  } = props;

  if (!location.state) {
    history.push('/distance_map');
  }

  let { arrDictionariesGroup } = languagesGroupState;
  const {
    allField,
    dictionaries: allDictionaries,
    languageTree
  } = dataForTree;
  const {
    mainDictionary,
    languagesGroup,
  } = location.state;


  const nodeLanguages = buildLanguageTree(fromJS(languageTree)).toJS();

  const parentId = mainDictionary[0].parent_id;
  const [labelDict, setLabelDict] = useState(null);
  const [availabilityOfDictionary, setAvailabilityOfDictionary] = useState(true)
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
    setAvailabilityOfDictionary(true)
    allDictionaries.forEach((dict) => {
      if ((id2str(dict.parent_id) === id2str(lang.id)) && dict.perspectives[1] && dict.perspectives[0] && dict.additional_metadata.location !== null) {
        if (checkLexicalEntries(dict.perspectives[0].translation) || checkLexicalEntries(dict.perspectives[1].translation)) {
          arrDictionary.push(dict);
        }
      }
    });
    console.log(arrDictionary)
    if (arrDictionary.length === 0) {
      setAvailabilityOfDictionary(false)
      console.log('arrDictionary')
    }
    setSelectedLanguage(arrDictionary);


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
      setAvailabilityOfDictionary(true)
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
      <Segment.Group >
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
                {(!availabilityOfDictionary) && (
          <Segment>
            <Label> {getTranslation('выбери язык')}</Label>
          </Segment>
        )}
      </Segment.Group>
      <Button onClick={() => {
        actions.setDefaultGroup();
        history.goBack();
      }}
      > {getTranslation('Back')}
      </Button>

      <Link
        to={{
          pathname: '/distance_map/selected_languages/map',
          state: {
            dictionaries: arrDictionariesGroup,
            mainDictionary: mainDict,
            rootLanguage,
            allField
          }
        }}
      >
        <Button onClick={() => actions.setLanguagesGroup({ arrDictionariesGroup })}> {getTranslation('Next')} </Button>
      </Link>


    </div >
  );
}

selectorLangGroup.propTypes = {
  languagesGroupState: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dataForTree: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

export default compose(
  connect(
    state => ({ ...state.distanceMap })
    , dispatch => ({ actions: bindActionCreators({ setLanguagesGroup, setDefaultGroup }, dispatch) })
  ),
  withApollo
)(selectorLangGroup);
