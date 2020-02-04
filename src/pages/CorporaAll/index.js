import React from 'react';
import { getTranslation } from 'api/i18n';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import {compose} from 'recompose';
const dictionariesCopora= gql`
query dictionariesAll{
    dictionaries(category:1){
      category
      parent_id
    }
    }`;
 const entity=gql`
    query entityAll($id:dictionariesAll){
        entity(id:$id){
            content 
        }
    }`;

    const test4 = (props) =>{
            const { data: { dictionaries: dictionariesAll } } = props;
            console.log(dictionariesAll,'dictionary')
          /*   const test8 =compose(graphql(entity))(CorporaAll) */
        /*     console.log(test8,'test8') */
            return(
                <div>
                    test4
                </div>
            )
    }



const CorporaAll = (props) => {

/* graphql(entity(dictionariesAll[0].parent_id)) */
    return (
      <div>
       CorporaAll
     
      </div>

    );
  }


export default (graphql(dictionariesCopora))(test4) ;