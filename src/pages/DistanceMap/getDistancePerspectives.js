import { chooseTranslation as T } from "api/i18n";
import { compositeIdToString as id2str } from "utils/compositeId";

import checkLexicalEntries from "./checkLexicalEntries";

const getDistance = async (dictionaries, allField, mainDictionary, computeDistancePerspectives, rootLanguage) => {
  const baseLanguageId = rootLanguage.parent_id;
  const fieldDict = {};
  const availableList = [];
  const perspectiveList = [];
  const transcriptionFieldIdStrList = [];
  const translationFieldIdStrList = [];
  const perspectiveSelectionList = [];
  let textFields = [];
  let groupFieldIdStr = "";
  let groupFields = null;
  let sourcePerspectiveId = {};

  allField.forEach(field => {
    fieldDict[id2str(field.id)] = field;
  });

  mainDictionary.perspectives.forEach(el => {
    if (checkLexicalEntries(T(el.translations))) {
      sourcePerspectiveId = el.id;
      groupFields = el.columns
        .map(column => fieldDict[id2str(column.field_id)])
        .filter(field => (field && field.data_type && (field.data_type === "Grouping Tag")));
    }
  });

  groupFields.forEach(field => {
    if (field.english_translation.toLowerCase().includes("cognate")) {
      groupFieldIdStr = id2str(field.id);
    }
  });

  if (!groupFieldIdStr && groupFields.length > 0) {
    groupFieldIdStr = id2str(groupFields[0].id);
  }

  const groupField = fieldDict[groupFieldIdStr];

  dictionaries.forEach(dictionary => {
    dictionary.perspectives.forEach(perspective => {
      let pgroupFlag = false;
      let textFlag = false;
      perspective.columns.forEach(column => {
        const field = fieldDict[id2str(column.field_id)];

        if (field && field.data_type && (field.data_type === "Grouping Tag")) {
          pgroupFlag = true;
        }

        if (field && field.data_type && (field.data_type === "Text")) {
          textFlag = true;
        }
      });
      if (pgroupFlag && textFlag) {
        availableList.push([perspective]);
      }
    });
  });

  availableList.forEach(([perspective]) => {
    perspectiveList.push({ perspective });

    textFields = perspective.columns
      .map(column => fieldDict[id2str(column.field_id)])
      .filter(field => (field && field.data_type && (field.data_type === "Text")));

    let transcriptionFieldIdStr = "";
    let translationFieldIdStr = "";
    textFields.forEach(field => {
      const checkStr = field.english_translation.toLowerCase();

      if (!transcriptionFieldIdStr && checkStr.includes("transcription")) {
        transcriptionFieldIdStr = id2str(field.id);
      }

      if (!translationFieldIdStr && (checkStr.includes("translation") || checkStr.includes("meaning"))) {
        translationFieldIdStr = id2str(field.id);
      }
    });

    if (textFields.length > 0) {
      if (!transcriptionFieldIdStr) {
        transcriptionFieldIdStr = id2str(textFields[0].id);
      }

      if (!translationFieldIdStr) {
        translationFieldIdStr = id2str(textFields[0].id);
      }
    }

    transcriptionFieldIdStrList.push(transcriptionFieldIdStr);
    translationFieldIdStrList.push(translationFieldIdStr);
    perspectiveSelectionList.push(true);
  });

  const perspectiveInfoList = perspectiveList
    .map(({ perspective }, index) => [
      null,
      perspective.id,
      fieldDict[transcriptionFieldIdStrList[index]].id,
      fieldDict[translationFieldIdStrList[index]].id,
      null
    ])
    .filter((_perspectiveInfo, index) => perspectiveSelectionList[index]);
  let responseMutanion = null;
  try {
    responseMutanion = await computeDistancePerspectives({
      variables: {
        sourcePerspectiveId,
        baseLanguageId,
        groupFieldId: groupField.id,
        perspectiveInfoList,
        multiList: [],
        mode: "",
        matchTranslationsValue: 1,
        onlyOrphansFlag: true,
        figureFlag: true,
        debugFlag: false,
        intermediateFlag: false,
        distanceFlag: true,
        referencePerspectiveId: sourcePerspectiveId
      }
    });
  } catch (error) {
    return [];
  }

  const distanceList = responseMutanion.data.cognate_analysis.distance_list;
  const dictionariesWithDistance = [];

  if (distanceList[0] === 0 || distanceList[0] === -1) {
    return [];
  }

  distanceList.forEach(distance => {
    dictionaries.forEach(dict => {
      dict.perspectives.forEach(persp => {
        if (persp.id[0] === distance[0][0] && persp.id[1] === distance[0][1]) {
          const distanceDict = distance[1];

          dictionariesWithDistance.push({
            ...dict,
            distanceDict
          });
        }
      });
    });
  });

  return dictionariesWithDistance;
};

export default getDistance;
