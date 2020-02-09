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
query {
  entity(id:id){content }
  
}`;

const test1 = (props) => {
  //graphql(entity)(qwe)
  console.log(props, 'props tes1')
  for (let i = 0; i < props.length - 1; i++) {
    let id = props[i].parent_id;
    let qwe = graphql(entity, { options: { variables: id } })

    console.log(qwe, 'qwe entity')
    return qwe

  }

}
const test3 = (props) => {
  const { data } = props;
  console.log(data, 'datatest3')
}
const testExport = (props) => {
  const { data } = props;
  console.log(data, 'data testExport')
  return (
    <div>
      tgftergeh
    </div>
  )
}
const test4 = (props) => {
  const { data: { dictionaries: dictionariesAll } } = props;
  if (dictionariesAll !== undefined) {
    for (let i = 0; i < dictionariesAll.length - 1; i++) {
      id = dictionariesAll[i].parent_id;

      /*      compose(graphql(entity,
            {options:{variables:id}})(test3)) */
    }
  }

  return (
    <div>
      tgftergeh
    </div>
  )
}

let id = [678,2];

const testConst = compose(
  graphql(entity,
    {options:
      {variables:
        {id:id}
      }}
  ),
  graphql(dictionariesCopora)
)(testExport);

// export default compose( asd, graphql(dictionariesCopora)(test4));
/* export default compose (graphql(entity,
  {options:{variables:$id}}),graphql(dictionariesCopora))(test4) */
/* export default test4; */
export default testConst;