import { compositeIdToString as id2str } from 'utils/compositeId';

function formationPerspectiveInfoList(dictionaries, allField, mainDictionary) {
  const perspectiveInfoList = [];
  let phonemicTranscription;
  let meaning;
  let cognates;
  const allFieldList = allField.all_fields;
  if (allFieldList) {
    for (const field of allFieldList) {
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




  dictionaries.push(mainDictionary)
  dictionaries.map((dict) => {
    if (dict && dict.perspectives) {
      dict.perspectives.forEach((perspective) => {
        if (perspective.translation === 'Lexical Entries') {
          /*  let perspectiveInfo = [perspective.id, phonemicTranscription, meaning] */
          const perspectiveInfo = [perspective.id, [66, 8], [66, 10]];
          perspectiveInfoList.push(perspectiveInfo);
        }
      });
    }
  });
console.log(perspectiveInfoList)
  return { perspectiveInfoList, cognates };
}

const calculateColorForDict = async (dictionaries, allField, mainDictionary, test, rootLanguage) => {
  // const searchField = formationPerspectiveInfoList(dictionaries, allField, mainDictionary);
  // const sourcePerspectiveId = mainDictionary.perspectives[0].id;
  // const baseLanguageId = rootLanguage.parent_id;
  // const { perspectiveInfoList } = searchField;
  // const groupFieldId = searchField.cognates;


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
      referencePerspectiveId: sourcePerspectiveId
    },
  });

  const distanceList = e.data.cognate_analysis.distance_list;
  const dictionariesWithColors = [];

  distanceList.forEach((distance) => {
    dictionaries.forEach((dict) => {
      dict.perspectives.forEach((persp) => {
        if (persp.id[0] === distance[0][0] && persp.id[1] === distance[0][1]) {
          const distanceDict = distance[1];

          dictionariesWithColors.push({
            ...dict,
            distanceDict
          });
        }
      });
    });
  });

  return dictionariesWithColors;
};

export default calculateColorForDict;
