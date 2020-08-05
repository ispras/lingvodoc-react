
import React, { useState } from 'react';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Label, Checkbox, Segment, Button, Step } from 'semantic-ui-react';
import { compose, branch, renderNothing } from 'recompose';

const dictName = gql`query dictName($id:LingvodocID) {
  dictionary(id:$id){
    id
    translation
  }
  }
   `;

function Limiter({
  mainGroup, mainDictionary, client, languagesGroup, mainDictionaryFun, allLanguages
}) {
  const parent_id = mainDictionary.toJS()[0].parent_id;
  const [labelDict, setLabelDict] = useState(null);
  const [nodeLanguages, setNodeLanguages] = useState([])
  let rootLanguage = {}
  let mainDict = []
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
    const arr = []
    if (nodeLanguages.length === 0) {

      for (const nodeLang of allLanguages) {
        if (nodeLang.parent_id === null) {
          arr.push(nodeLang)
        }
      }
    }
    setNodeLanguages(arr)
    console.log(nodeLanguages)
  }

  function selectNodeLanguage(id) {
    console.log(id)
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
              <Button key={lang.id[0]} onClick={() => selectNodeLanguage(lang)}>{lang.translation}</Button>)}
          </Segment>
        )}
      </Segment.Group>
      <Button onClick={sendDict}>Готово </Button>
      <Button onClick={back}>Назад</Button>
    </div >
  );
}


export default compose(withApollo)(Limiter);
