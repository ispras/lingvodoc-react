import React from 'react';
import { getTranslation } from 'api/i18n';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';

const dictionariesCopora = gql`
query dictionariesAll{
    dictionaries(category:1){
      parent_id
    }
}`;


const entity = gql`
    query entityAll($id:id){
      entity(id:$id){
      content 
    }
}`;

const test1 = (props) => {
  //graphql(entity)(qwe)
  console.log(props, 'props tes1')
  for (let i = 0; i < props.length - 1; i++) {
    let id = props[i].parent_id;
    // console.log(id, 'id');
  // let ter = graphql(entity)
  // console.log(ter,'ter')
  // qwe(ter) 
  }
}


const test4 = (props) => {
  const { data: {dictionaries:dictionariesAll} } = props;
  if (dictionariesAll !== undefined){
      // console.log(dictionariesAll,'dictionariesAll')
      // test1(dictionariesAll);
   
  }

 // console.log(data, 'props test4');

//  console.log(dictionariesAll, 'dictionary');
 /*  if (dictionariesAll !== undefined) {
    console.log(dictionariesAll.length, 'length')
    for (let i = 0; i < dictionariesAll.length - 1; i++) {
      let id = dictionariesAll[i].parent_id;
      console.log(id, 'id')
    } */
    return (
      <div>
        tgftergeh
    </div>
    )
}


const iop = ( props ) => {
  return props;
}

const qwe = ( q ) => {
  console.log( q );

  return (
    <div>
      fsfsfsw
    </div>
  )
};

const zxc = ( z ) => {
  return (
    <div>
      fsfsfsw
    </div>
  )
}

export default compose( qwe, graphql( dictionariesCopora )( iop ) )( zxc );

/* export default rty; */
// export default compose( asd, graphql(dictionariesCopora)(test4));
// export default (graphql(dictionariesCopora)(test4))