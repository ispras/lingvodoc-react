import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Dropdown } from 'semantic-ui-react';
import styled from 'styled-components';

const Wrapper = styled(Container)`
`;

const DictionaryContainer = styled.div`
  padding-left: 1em;
`;

const LanguageContainer = styled.div`
  padding: 0em 1em;
`;

const Translation = styled.span`
  text-decoration: underline;
`;

const Perspective = ({ client_id, object_id, parent_client_id, parent_object_id, authors = {}, translation = '' }) =>
  <Dropdown.Item as={Link} to={`dictionary/${parent_client_id}/${parent_object_id}/perspective/${client_id}/${object_id}`}>
    {translation} {authors.content && ` (${authors.content})`}
  </Dropdown.Item>;

const Dictionary = ({ client_id, object_id, translation, perspectives }) =>
  <DictionaryContainer>
    <span>{translation} </span>
    <Dropdown inline text="View">
      <Dropdown.Menu>
        {
          perspectives.filter(
            v => v.parent_client_id === client_id && v.parent_object_id === object_id
          ).map(pers => <Perspective {...pers} />)
        }
      </Dropdown.Menu>
    </Dropdown>
  </DictionaryContainer>;

const Section = ({ dicts = [], contains = [], translation, perspectives }) =>
  <LanguageContainer>
    <Translation>{translation}</Translation>
    {
      contains.map(sub => <Section perspectives={perspectives} {...sub} />)
    }
    {
      dicts.map(dict => <Dictionary perspectives={perspectives} {...dict} />)
    }
  </LanguageContainer>;

function Home({ dictionaries, perspectives }) {
  const processed = perspectives.valueSeq().toArray();
  return (
    <Wrapper>
      <h2>Опубликованные словари</h2>
      {
        dictionaries.map(dict => <Section perspectives={processed} {...dict} />)
      }
    </Wrapper>
  );
}

Home.propTypes = {
  dictionaries: PropTypes.array.isRequired,
  perspectives: PropTypes.any.isRequired,
};

export default connect(
  state => state.data
)(Home);
