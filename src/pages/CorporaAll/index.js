import React from 'react';
import { getTranslation } from 'api/i18n';
import gql from 'graphql-tag';
import { graphql, withApollo } from 'react-apollo';
import { compose } from 'recompose';


const dictionariesCopora = gql`
query dictionariesAll{
    dictionary(category:1){
      id
    }
}`;


const entity = gql`
query {
  entity(id:LingvodocID){
      content
     }
  
}`;


class test4 extends React.Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    const { dictionaries, client } = this.props;
    this.state = {
      parent_id: []
    }
    if (!dictionaries.dictionaries) {
      dictionaries.refetch().then(() => {
        console.log(this.props.dictionaries);
        let dictionariesAll = this.props.dictionaries.dictionaries;
        console.log(dictionariesAll, 'dictionariesAll')
        for (let i = 0; i < dictionariesAll.length - 1; i++) {
          console.log(client, 'client');
          this.setState({ parent_id: dictionariesAll[i].id });
          let idLin = dictionariesAll[i].id;
          console.log(idLin, 'idLin')
          client.query({
            query: entity,
            variables: { id: idLin },
            name: 'entity'

          }).then(result => {
            console.log(result)
          });

        }

      });
    }

  }

  render() {
    return (
      <div>
        tgftergeh
    </div>
    )
  }

}

// export default compose( asd, graphql(dictionariesCopora)(test4));
/* export default compose (graphql(entity,
  {options:{variables:$id}}),graphql(dictionariesCopora))(test4) */
/* export default test4; */
export default compose(graphql(dictionariesCopora, { name: 'dictionaries' }), withApollo)(test4);