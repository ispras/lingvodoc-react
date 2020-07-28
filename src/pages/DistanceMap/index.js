import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import MapDict from './map';
import { Dropdown, Label } from 'semantic-ui-react';
import SelectorDict from './selectorDict';
import SelectorLangGropu from './selectorLangGroup';
import { compose } from 'recompose'

const dictionaryWithPerspectives = gql`
  query DictionaryWithPerspectivesProxy {
    dictionaries(proxy: false, published: true) {
      id
      parent_id
      translation
      additional_metadata {
        authors
        location
      }
      perspectives {
        id
        translation
        
      }
    }
    perspectives {
      id
      parent_id
      translation
      
    }
    language_tree {
      id
      parent_id
      translation
      created_at
    }
    is_authenticated
  }
`;


const test = gql` mutation computeCognateAnalysis(
  $sourcePerspectiveId: LingvodocID!, 
  $baseLanguageId: LingvodocID!,
  $groupFieldId: LingvodocID!,
  $perspectiveInfoList: [[LingvodocID]]!,
  $multiList: [ObjectVal],
  $mode: String,
  $figureFlag: Boolean,
  $matchTranslationsValue: Int,
  $onlyOrphansFlag: Boolean,
  $debugFlag: Boolean,
  $intermediateFlag: Boolean,
  $distanceFlag :Boolean
  $referencePerspectiveId:LingvodocID!) {
    cognate_analysis(
      source_perspective_id: $sourcePerspectiveId,
      base_language_id: $baseLanguageId,
      group_field_id: $groupFieldId,
      perspective_info_list: $perspectiveInfoList,
      multi_list: $multiList,
      mode: $mode,
      match_translations_value: $matchTranslationsValue,
      only_orphans_flag: $onlyOrphansFlag,
      figure_flag: $figureFlag,
      debug_flag: $debugFlag,
      intermediate_flag: $intermediateFlag,
      distance_flag: $distanceFlag,
     reference_perspective_id: $referencePerspectiveId)
    {
      distance_list
    }
}`






class SelectorDictionary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dictionary: null,
      groupLang: null,
    };
    this.arrLang = [];
  }
  handleResult = ({
    data: {
      cognate_analysis: {
        distance_list } } }) => {
/*     console.log(distance_list) */

  }
  render() {
    const { data: { dictionaries } } = this.props;
    this.props.test({
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




    const mainDictionary = (e) => {
      this.setState({ dictionary: e });
    };
    const mainGroup = (e) => {
      this.setState({ groupLang: e });
    };
    const languagesGroup = (e) => {
      this.arrLang.push(e);
    };

    return (
      <div>

        {(this.state.dictionary === null && this.state.groupLang === null && <SelectorDict languagesGroup={languagesGroup} dictWithPersp={this.props.data} mainDictionary={mainDictionary} />)}
        {(this.state.dictionary !== null && this.state.groupLang === null && <SelectorLangGropu mainDictionaryFun={mainDictionary} languagesGroup={this.arrLang} mainGroup={mainGroup} mainDictionary={this.state.dictionary} />)}
        {(this.state.groupLang !== null && <MapDict dictionaries={this.state.groupLang} mainDictionary={this.state.dictionary} />)}

      </div>
    );
  }
}


export default compose(graphql(dictionaryWithPerspectives), graphql(test, { name: 'test' }))(SelectorDictionary);



