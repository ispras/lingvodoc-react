import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Label, Checkbox, Segment, Button } from 'semantic-ui-react';
import { compose } from 'recompose';
import Immutable, { fromJS, Map } from 'immutable';
import { buildLanguageTree, assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import { getTranslation } from 'api/i18n';
import { Link, Redirect } from 'react-router-dom';
import checkLexicalEntries from './checkLexicalEntries';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setLanguagesGroup, setDefaultGroup } from 'ducks/distanceMap';
import TreeBtn from './treeBtn';
import { compositeIdToString } from 'utils/compositeId';


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

class selectorLangGroup extends React.Component {
  constructor(props) {
    super(props);
    const {
      client, location, actions, languagesGroupState, history, dataForTree, selected
    } = props;

    if (!location.state) {
      history.push('/distance_map');
    }
    if (selected && (selected.id !== dataForTree.idLocale)) {
      history.push('/distance_map');
    }

    this.state = {
      labelDict: null
    };

    this.treeBtnRefs = [];

    this.setTextInputRef = element => {
      this.treeBtnRefs.push( element );
    };
  }


  componentWillMount() {
    const {
      client, location, actions, languagesGroupState, history, dataForTree, selected
    } = this.props;
    const {
      mainDictionary,
      languagesGroup,
    } = location.state;
    const parentId = mainDictionary[0].parent_id;
    client.query({
      query: dictionaryName,
      variables: { id: parentId },
    }).then(result => this.setState({ labelDict: result.data.dictionary.translatio }));
  }


  render() {
    const {
      client, location, actions, languagesGroupState, history, dataForTree, selected
    } = this.props;

    const { arrDictionariesGroup } = languagesGroupState;
    const {
      allField,
      dictionaries: allDictionaries,
      languageTree,
      perspectives
    } = dataForTree;


    const dictsSource = fromJS(allDictionaries);


    const dicts = dictsSource.reduce(
      (acc, dict) => acc.set(dict.get('id'), dict.set(dict)),
      new Map()
    );
    const languageTreeNew = buildLanguageTree(fromJS(languageTree));

    const localPer = fromJS(perspectives);
    const localDic = fromJS(dicts);


    const nodeLanguagesNew = assignDictsToTree(
      buildDictTrees(fromJS({
        lexical_entries: [],
        perspectives: localPer,
        dictionaries: localDic,
      })),
      languageTreeNew
    );

    const nodeLanguages = nodeLanguagesNew.toJS();

    const treeBtns = nodeLanguages.map(item => <TreeBtn
      key={compositeIdToString(item.id)}
      title={item.translation}
      data={item.children}
      ref={this.setTextInputRef}
      dataLang={item}
    />);
    return (
      <Segment>
        {treeBtns}
      </Segment>

    );
  }
}

selectorLangGroup.propTypes = {
  languagesGroupState: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dataForTree: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  selected: PropTypes.object.isRequired
};

export default compose(
  connect(
    state => ({ ...state.distanceMap })
    , dispatch => ({ actions: bindActionCreators({ setLanguagesGroup, setDefaultGroup }, dispatch) })
  ),
  connect(state => state.locale),
  withApollo
)(selectorLangGroup);
