import 'styles/published.scss';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Dropdown } from 'semantic-ui-react';

const Perspective = ({ client_id, object_id, parent_client_id, parent_object_id, authors = {}, translation = '' }) =>
  <Dropdown.Item as={Link} to={`dictionary/${parent_client_id}/${parent_object_id}/perspective/${client_id}/${object_id}`}>
    {translation} {authors.content && ` (${authors.content})`}
  </Dropdown.Item>;

const Dictionary = ({ client_id, object_id, translation, perspectives }) =>
  <div className="dict">
    <span>{translation} </span>
    <Dropdown inline text="View">
      <Dropdown.Menu>
        {
          perspectives.filter(
            v => v.parent_client_id === client_id && v.parent_object_id === object_id
          ).map(pers =>
            <Perspective
              key={`${pers.client_id}/${pers.object_id}`}
              {...pers}
            />
          )
        }
      </Dropdown.Menu>
    </Dropdown>
  </div>;

const Section = ({ dicts = [], contains = [], translation, perspectives }) =>
  <div className="lang">
    <span className="translation">{translation}</span>
    {
      contains.map(sub =>
        <Section
          key={`${sub.client_id}/${sub.object_id}`}
          perspectives={perspectives}
          {...sub}
        />
      )
    }
    {
      dicts.map(dict =>
        <Dictionary
          key={`${dict.client_id}/${dict.object_id}`}
          perspectives={perspectives}
          {...dict}
        />
      )
    }
  </div>;

function Home({ dictionaries, perspectives }) {
  const processed = perspectives.valueSeq().toArray();
  return (
    <Container className="published">
      <h2>Опубликованные словари</h2>
      {
        dictionaries.map(dict =>
          <Section
            key={`${dict.client_id}/${dict.object_id}`}
            perspectives={processed}
            {...dict}
          />
        )
      }
    </Container>
  );
}

Home.propTypes = {
  dictionaries: PropTypes.array.isRequired,
  perspectives: PropTypes.any.isRequired,
};

export default connect(
  state => state.data
)(Home);
