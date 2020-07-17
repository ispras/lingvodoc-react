import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import Tree from 'pages/Home/components/Tree'
import Immutable, { fromJS } from 'immutable';

class Selector extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
     const {dictWithPersp:{dictionaries,language_tree,perspectives}}=this.props
     console.log(this.props)
/*      const tree = assignDictsToTree(
        buildDictTrees(fromJS({
          lexical_entries: [],
          perspectives,
          dictionaries,
        })),
        language_tree
      ); */
    
        return(
            <div>
{/*  <Tree tree={tree} canSelectDictionaries={true} /> */}
            </div>
        )
    }
}

export default Selector