
import { compositeIdToString as id2str } from 'utils/compositeId';

const calculateColorForDict = async (dictionaries, allField, mainDictionary, test, rootLanguage) => {
  dictionaries.push(mainDictionary);
  const fieldDict = {};
  let groupFieldIdStr = '';
  let groupFields = null;
  let sourcePerspectiveId = {};
  const baseLanguageId = rootLanguage.parent_id;

  for (const field of allField.all_fields) {
    fieldDict[id2str(field.id)] = field;
  }

  sourcePerspectiveId = mainDictionary.perspectives[1].id;
  groupFields = mainDictionary.perspectives[1].columns
    .map(column => fieldDict[id2str(column.field_id)])
    .filter(field => field.data_type === 'Grouping Tag');

  // mainDictionary.perspectives.forEach((el) => {
  //   if (el.translation === 'Lexical Entries') {
  //     sourcePerspectiveId = el.id;
  //     groupFields = el.columns
  //       .map(column => fieldDict[id2str(column.field_id)])
  //       .filter(field => field.data_type === 'Grouping Tag');
  //   }
  // });


  for (const field of groupFields) {
    if (field.english_translation.toLowerCase().includes('cognate')) {
      groupFieldIdStr = id2str(field.id);
      break;
    }
  }

  if (!groupFieldIdStr && groupFields.length > 0) { groupFieldIdStr = id2str(groupFields[0].id); }

  const groupField = fieldDict[groupFieldIdStr];

  console.log('Best groupField:', groupField.id);

  /* ******************************************************************************** */

  const available_list = [];
  const perspective_list = [];
  const transcriptionFieldIdStrList = [];
  const translationFieldIdStrList = [];
  const perspectiveSelectionList = [];
  let textFields = [];


  for (const dictionary of dictionaries) {
    for (const perspective of dictionary.perspectives) {
      let group_flag = false;
      let text_flag = false;

      for (const column of perspective.columns) {
        const field = fieldDict[id2str(column.field_id)];

        if (field.data_type === 'Grouping Tag') { group_flag = true; }

        if (field.data_type === 'Text') { text_flag = true; }
      }

      if (group_flag && text_flag) {
        available_list.push([perspective]);
      }
    }
  }


  for (const [perspective] of available_list) {
    perspective_list.push({ perspective });

    textFields = perspective.columns
      .map(column => fieldDict[id2str(column.field_id)])
      .filter(field => field.data_type === 'Text');

    let transcriptionFieldIdStr = '';
    let translationFieldIdStr = '';

    for (const field of textFields) {
      const check_str = field.english_translation.toLowerCase();

      if (!transcriptionFieldIdStr &&
        check_str.includes('transcription')) { transcriptionFieldIdStr = id2str(field.id); }

      if (!translationFieldIdStr &&
        (check_str.includes('translation') || check_str.includes('meaning'))) { translationFieldIdStr = id2str(field.id); }
    }

    if (textFields.length > 0) {
      if (!transcriptionFieldIdStr) { transcriptionFieldIdStr = id2str(textFields[0].id); }

      if (!translationFieldIdStr) { translationFieldIdStr = id2str(textFields[0].id); }
    }

    transcriptionFieldIdStrList.push(transcriptionFieldIdStr);
    translationFieldIdStrList.push(translationFieldIdStr);
    perspectiveSelectionList.push(true);
  }

  const bestPerspectiveInfoList = perspective_list
    .map(({ perspective }, index) => [perspective.id,
      fieldDict[transcriptionFieldIdStrList[index]].id,
      fieldDict[translationFieldIdStrList[index]].id])
    .filter((perspective_info, index) =>
      (perspectiveSelectionList[index]));

  console.log('bestPerspectiveInfoList', bestPerspectiveInfoList);
  const e = await test({
    variables: {
      sourcePerspectiveId,
      baseLanguageId,
      groupFieldId: groupField.id,
      perspectiveInfoList: bestPerspectiveInfoList,
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
