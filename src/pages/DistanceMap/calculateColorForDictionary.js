import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import util from 'utils/string'
/*   this.props.test({
    variables: {
      sourcePerspectiveId: [657, 4],
      baseLanguageId: [508, 45],
      groupFieldId: [66, 25],
      perspectiveInfoList: [
        [[688, 14233], [66, 8], [66, 10]],
        [[656, 3], [66, 8], [66, 10]],
        [[660, 8], [66, 8], [66, 10]],
        [[657, 4], [66, 8], [66, 10]],
        [[2872, 20255], [66, 8], [66, 10]],
        [[2685, 1654], [66, 8], [66, 10]],
        [[2685, 847], [66, 8], [66, 10]],
        [[2685, 7], [66, 8], [66, 10]],
        [[867, 10], [66, 8], [66, 10]],
        [[652, 3], [66, 8], [66, 10]],
        [[2654, 9324], [66, 8], [66, 10]],
        [[1393, 29132], [66, 8], [66, 10]]],
      multiList: [],
      mode: "",
      matchTranslationsValue: 1,
      onlyOrphansFlag: true,
      figureFlag: true,
      debugFlag: false,
      intermediateFlag: false,
      distanceFlag: true,
      referencePerspectiveId: [657, 4]
    },
  }).then(e => this.handleResult(e)
  );


  handleResult = ({
    data: {
      cognate_analysis: {
        distance_list } } }) => {
    console.log(distance_list)

  }


 */


function formationPerspectiveInfoList(dictionaries, all_fields, mainDictionary) {
  const perspectiveInfoList = [];
  let phonemicTranscription;
  let meaning;
  let cognates;

  if (all_fields) {
    for (const field of all_fields) {
      if (field.translation === 'Phonemic  transcription') {
        phonemicTranscription = phonemicTranscription || field.id;
      }
      if (field.translation === 'Meaning') {
        meaning = field.id;
      }

      if (field.translation === 'Cognates') {
        cognates = field.id;
      }
    }
  }

  dictionaries.push(mainDictionary);

  dictionaries.map((dict) => {
    if (dict && dict.perspectives) {
      dict.perspectives.forEach((perspective) => {
        /*  let perspectiveInfo = [perspective.id, phonemicTranscription, meaning] */
        const perspectiveInfo = [perspective.id, [66, 8], [66, 10]];
        perspectiveInfoList.push(perspectiveInfo);
      });
    }
  });


  return { perspectiveInfoList, cognates };
}

const calculateColorForDict = async (dictionaries, all_fields, mainDictionary, test, rootLanguage) => {
  const searchField = formationPerspectiveInfoList(dictionaries, all_fields, mainDictionary);
  const sourcePerspectiveId = mainDictionary.perspectives[0].id;
  const baseLanguageId = rootLanguage.parent_id;
  const { perspectiveInfoList } = searchField;
  const groupFieldId = searchField.cognates;


const makeColorOfNumber = (number) => {
  const baseColor = 8366700;

  if (number >= 1) {
    number = number * 1000
  } else {
    number = number * 100
  }
  const numberOf10In16 = (baseColor + number).toString(16);
  return '#' + numberOf10In16

};

  const e = await test({
    variables: {
      sourcePerspectiveId,
      baseLanguageId,
      groupFieldId,
      perspectiveInfoList,
      multiList: [],
      mode: '',
      matchTranslationsValue: 1,
      onlyOrphansFlag: true,
      figureFlag: true,
      debugFlag: false,
      intermediateFlag: false,
      distanceFlag: true,
      referencePerspectiveId: perspectiveInfoList[0][0]
    },
  })

  const distanceList = e.data.cognate_analysis.distance_list;
  const dictionariesWithColors = []

  distanceList.forEach((distance) => {
    dictionaries.forEach((dict) => {
      dict.perspectives.forEach((persp) => {
        if (persp.id[0] === distance[0][0] && persp.id[1] === distance[0][1]) {
          const color = makeColorOfNumber(distance[1]);

          dictionariesWithColors.push({
            ...dict,
            color
          })
        }
      });
    });
  });

  return dictionariesWithColors;


};

export default calculateColorForDict;
