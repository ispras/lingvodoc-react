
import React, { useState } from 'react';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Label, Checkbox, Segment, Button, Step } from 'semantic-ui-react';
import { compose, branch, renderNothing } from 'recompose';
import Immutable, { fromJS, Map } from 'immutable';
import { buildLanguageTree } from 'pages/Search/treeBuilder';

const dictName = gql`query dictName($id:LingvodocID) {
  dictionary(id:$id){
    id
    translation
  }
}`;

function Limiter({
  mainGroup, mainDictionary, client, languagesGroup, mainDictionaryFun, allLanguages, allDictionaries
}) {
  const parent_id = mainDictionary.toJS()[0].parent_id;
  const [labelDict, setLabelDict] = useState(null);
  const [childLanguages, setChildLanguages] = useState([])
  const [nodeLanguages, setNodeLanguages] = useState([])
  const [twoChildLanguages, setTwoChildLanguages] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState([])
  let rootLanguage = {}
  let mainDict = [];

  const arrDictionaryGroup = [];
  client.query({
    query: dictName,
    variables: { id: parent_id },
  }).then(result => setLabelDict(result.data.dictionary.translation));

  for (const language of languagesGroup) {
    for (const children of language.children) {
      for (const perspective of children.perspectives) {
        if (perspective.id[0] === mainDictionary.toJS()[0].id[0] &&
          perspective.id[1] === mainDictionary.toJS()[0].id[1]) {
          rootLanguage = language;
          mainDict = children
        }
      }
    }
  }

  const filterDictionary = (e) => {

    arrDictionaryGroup.push(e);

  };
  function addLanguages() {

    if (nodeLanguages.length === 0) {
      const arr = buildLanguageTree(fromJS(allLanguages))
      setNodeLanguages(arr.toJS())

    }

  }

  function selectNodeLanguage(language) {
    setSelectedLanguage([])
    setTwoChildLanguages([])
    const languageChildren = language.children
    if (languageChildren.length !== 0) {
      return setChildLanguages(languageChildren)
    } else {
      dictionariesSelectedLanguges(language)
    }

  }

  function selectChildLanguage(language) {
    console.log('clik')
    const languageChildren = language.children
    setSelectedLanguage([])
    setTwoChildLanguages([])
    if (languageChildren.length !== 0) {
      return setTwoChildLanguages(languageChildren)
    } else {
      dictionariesSelectedLanguges(language)
    }

  }
  function dictionariesSelectedLanguges(lang) {
    setSelectedLanguage(lang)
    const arrDictionary = []
    for (const dict of allDictionaries) {
      if (dict.parent_id[0] === lang.id[0] && dict.parent_id[1] === lang.id[1])
        arrDictionary.push(dict)
    }
    setSelectedLanguage(arrDictionary)
  }
  function sendDict() {
    mainGroup(arrDictionaryGroup);
    mainDictionaryFun(mainDict, rootLanguage);
  };
  function back() {
    mainDictionaryFun(null)
  }

  return (
    <div>
      <Label size="massive" >{labelDict}</Label>
      <Segment.Group>
        {rootLanguage.children.map(dict =>
          (dict.translation !== mainDict.translation) && (dict.additional_metadata.location !== null) && (<Segment key={dict.id}>
            <Checkbox
              onChange={() => { filterDictionary(dict) }}
              label={dict.translation}
            />
          </Segment>)
        )}
      </Segment.Group>
      <Segment.Group>
        {(nodeLanguages.length === 0) && (<Button onClick={addLanguages}>Добавить словари других языковых групп</Button>)}
        {(nodeLanguages.length !== 0) && (
          <Segment >
            {nodeLanguages.map(lang =>
              <Button key={lang.id.join('_')} onClick={() => selectNodeLanguage(lang)}>{lang.translation}</Button>)}
          </Segment>
        )}
        {(childLanguages.length !== 0) && (
          <Segment >
            {childLanguages.map(lang =>
              <Button key={lang.id.join('_')} onClick={() => selectChildLanguage(lang)}>{lang.translation}</Button>)}
          </Segment>
        )}
        {(twoChildLanguages.length !== 0) && (
          <Segment >
            {twoChildLanguages.map(lang =>
              <Button key={lang.id.join('_')} onClick={() => dictionariesSelectedLanguges(lang)}>{lang.translation}</Button>)}
          </Segment>
        )}
        {(selectedLanguage.length !== 0) && (
          selectedLanguage.map(dict =>
            <Segment>
              {(dict.additional_metadata.location !== null) && (
                <Checkbox
                  onChange={() => { filterDictionary(dict) }}
                  key={dict.id.join('_')}
                  label={dict.translation}
                />
              )}

            </Segment>
          )
        )
        }
      </Segment.Group>
      <Button onClick={sendDict}>Готово </Button>
      <Button onClick={back}>Назад</Button>
    </div >
  );
}


export default compose(withApollo)(Limiter);
