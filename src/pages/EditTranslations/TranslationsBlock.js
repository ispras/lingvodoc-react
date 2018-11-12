import React from 'react';
import { Container, Loader, Header, Segment } from 'semantic-ui-react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import EditAtoms from './EditAtoms';
import { getTranslation } from 'api/i18n';

const getTranslationsQuery = gql`
  query getTranslations($gists_type: String!) {
    translationgists(gists_type: $gists_type) {
      id
      type
      translationatoms {
        id
        content
        locale_id
      }
    }
    all_locales
  }
`;

const TopContainer = styled(Container)`
  margin-top: 4rem;
`;

class TranslationsBlock extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      gistsType: props.gists_type,
      translationgists: props.translationgists
    }
  }

  componentWillReceiveProps(props) {
    if (!props.data.loading) {
      if (props.gists_type != this.state.gistsType) {
        this.refetching = true;
        props.data.refetch().then(result => {
          this.refetching = false;
          this.setState({ gistsType: props.gists_type, translationgists: result.data.translationgists });
        });
      }
    }
  }

  render() {
    const { data: { error, loading, translationgists, all_locales } } = this.props;
    if (error) {
      return null;
    }

    if (loading || this.refetching) {
      return <Loader active content={getTranslation('Loading')}></Loader>;
    }

    const typeGistsMap = new Map();
    let types = [];
    let currentType = null;
    translationgists.forEach(item => {
      if (item.translationatoms.length == 0)
        return;

      if (currentType == null || currentType != item.type) {
        currentType = item.type;
        types.push(currentType);
        typeGistsMap[currentType] = [];
      }
      else if (currentType == item.type) {
        typeGistsMap[currentType].push(item);
      }
    });
    
    return (
      <TopContainer fluid>
        {types.map((type, index) => (
          <Container fluid key={index}>
            <Header as='h1' textAlign='center' block>{getTranslation(type)}</Header>
            <Segment>
              {typeGistsMap[type].map((gist, index) => (
                <EditAtoms key={gist.id} gistId={gist.id} atoms={gist.translationatoms} locales={all_locales}></EditAtoms>
              ))}
            </Segment>
          </Container>
        ))}
      </TopContainer>
    );
  }

}

export default graphql(getTranslationsQuery)(TranslationsBlock);
