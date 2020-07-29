import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

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
/* return mainDictionary.perspectives[0].id */
  const perspectiveInfoList = [];
  let phonemicTranscription;
  let meaning;
  let cognates;

  console.log( all_fields )

  for (const field of all_fields) {
    if (field.translation === 'Phonemic  transcription') {
      phonemicTranscription = phonemicTranscription ? phonemicTranscription : field.id;
    }
    if (field.translation === 'Meaning') {
      meaning = field.id;
    }

    if (field.translation === 'Cognates') {
      cognates = field.id;
    }
  }


  dictionaries.map((dict) => {
  /*   perspectiveInfoList.push([dict.perspectives[0].id, phonemicTranscription, meaning]); */
    if ( dict && dict.perspectives ) {
        console.log( dict )

        dict.perspectives.forEach( ( perspective ) => {
            let perspectiveInfo = [ perspective.id, phonemicTranscription, meaning ]

            perspectiveInfoList.push( perspectiveInfo )
        })
    }
//   perspectiveInfoList.push([dict.perspectives[0].id, [66,8], [66,10]]);
});

  return { perspectiveInfoList, cognates };
}

const handleResult = ({
  data: {
    cognate_analysis: { distance_list }
  }
}) => {
  console.log(distance_list);
};


const calculateColorForDict = (dictionaries, all_fields, mainDictionary, test, rootLanguage) => {
  const searchField = formationPerspectiveInfoList(dictionaries, all_fields, mainDictionary);
  const sourcePerspectiveId = mainDictionary.perspectives[0].id;
  const baseLanguageId = rootLanguage.parent_id;
  const perspectiveInfoList = searchField.perspectiveInfoList;
  const groupFieldId = searchField.cognates;
//   console.log( rootLanguage )
//   console.log( dictionaries )

//     console.log( 'sourcePerspectiveId' )
//     console.log( sourcePerspectiveId )
//     console.log( 'baseLanguageId' )
//     console.log( baseLanguageId )
//     console.log( 'groupFieldId' )
//     console.log( groupFieldId )
    // console.log( 'perspectiveInfoos' )
    // console.log( perspectiveInfoList )
    console.log()


  test({
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
  }).then(e => handleResult(e));
//   test({
//     variables: {
//       sourcePerspectiveId: [657, 4],
//       baseLanguageId: [508, 45],
//       groupFieldId: [66, 25],
//       perspectiveInfoList: [
//         [[688, 14233], [66, 8], [66, 10]],
//         [[656, 3], [66, 8], [66, 10]],
//         [[660, 8], [66, 8], [66, 10]],
//         [[657, 4], [66, 8], [66, 10]],
//         [[2872, 20255], [66, 8], [66, 10]],
//         [[2685, 1654], [66, 8], [66, 10]],
//         [[2685, 847], [66, 8], [66, 10]],
//         [[2685, 7], [66, 8], [66, 10]],
//         [[867, 10], [66, 8], [66, 10]],
//         [[652, 3], [66, 8], [66, 10]],
//         [[2654, 9324], [66, 8], [66, 10]],
//         [[1393, 29132], [66, 8], [66, 10]]],
//       multiList: [],
//       mode: "",
//       matchTranslationsValue: 1,
//       onlyOrphansFlag: true,
//       figureFlag: true,
//       debugFlag: false,
//       intermediateFlag: false,
//       distanceFlag: true,
//       referencePerspectiveId: [657, 4]
//     },
//   }).then( e => handleResult( e ) );

};


export default calculateColorForDict;
