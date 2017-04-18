import 'styles/published.scss';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Dropdown, Icon } from 'semantic-ui-react';

import { requestPublished } from 'ducks/data';

const Perspective =
({
  client_id: cid,
  object_id: oid,
  parent_client_id: pcid,
  parent_object_id: poid,
  authors,
  translation,
}) =>
  <Dropdown.Item as={Link} to={`dictionary/${pcid}/${poid}/perspective/${cid}/${oid}`}>
    {translation} {authors.content && ` (${authors.content})`}
  </Dropdown.Item>;

Perspective.propTypes = {
  client_id: PropTypes.number.isRequired,
  object_id: PropTypes.number.isRequired,
  parent_client_id: PropTypes.number.isRequired,
  parent_object_id: PropTypes.number.isRequired,
  authors: PropTypes.object,
  translation: PropTypes.string,
};

Perspective.defaultProps = {
  authors: {},
  translation: '',
};

const Dictionary =
({
  translation,
  perspectives,
  history,
}) =>
  <div className="dict">
    <span title={history.join(' > ')} className="dict-name">{translation}</span>
    {
      perspectives && perspectives.valueSeq &&
        <Dropdown inline text={`View (${perspectives.size})`}>
          <Dropdown.Menu>
            {
              perspectives.valueSeq().map(pers =>
                <Perspective
                  key={`${pers.client_id}/${pers.object_id}`}
                  {...pers.toJS()}
                />
              )
            }
          </Dropdown.Menu>
        </Dropdown>
      }
  </div>;

Dictionary.propTypes = {
  translation: PropTypes.string.isRequired,
  perspectives: PropTypes.object,
  history: PropTypes.array.isRequired,
};

Dictionary.defaultProps = {
  perspectives: {},
};

const DictionaryList =
({
  dicts,
  history,
  perspectives,
}) => {
  if (dicts.length === 0) return null;

  return (
    <div className="dict-list">
      <span className="translation">
        {
          history.map(s =>
            <span key={s}>{s}</span>)
        }
      </span>
      {
        dicts.map(dict =>
          <Dictionary
            key={`${dict.client_id}/${dict.object_id}`}
            perspectives={perspectives.get(`${dict.client_id}/${dict.object_id}`)}
            history={history}
            {...dict}
          />
        )
      }
    </div>
  );
};

DictionaryList.propTypes = {
  dicts: PropTypes.array.isRequired,
  perspectives: PropTypes.object.isRequired,
  history: PropTypes.array.isRequired,
};

const Section =
({
  dicts,
  contains,
  history,
  translation,
  perspectives,
}) => {
  const newHistory = [...history, translation];

  return (
    <div className="section">
      {
        contains.map(sub =>
          <Section
            key={`${sub.client_id}/${sub.object_id}`}
            perspectives={perspectives}
            history={newHistory}
            {...sub}
          />
        )
      }
      <DictionaryList dicts={dicts} history={newHistory} perspectives={perspectives} />
    </div>
  );
};

Section.propTypes = {
  dicts: PropTypes.array,
  contains: PropTypes.array,
  history: PropTypes.array,
  translation: PropTypes.string.isRequired,
  perspectives: PropTypes.object.isRequired,
};

Section.defaultProps = {
  dicts: [],
  contains: [],
  history: [],
};

class Home extends React.Component {
  static propTypes = {
    dictionaries: PropTypes.array.isRequired,
    perspectives: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.props.dispatch(requestPublished());
  }

  render() {
    const {
      dictionaries,
      perspectives,
      loading,
    } = this.props;

    const groupedByParent = perspectives.groupBy(v => `${v.parent_client_id}/${v.parent_object_id}`);

    return (
      <Container className="published">
        <h2>Опубликованные словари</h2>
        {
          loading && dictionaries.length === 0
            ? <Icon name="spinner" loading />
            : dictionaries.map(dict =>
              <Section
                key={`${dict.client_id}/${dict.object_id}`}
                perspectives={groupedByParent}
                {...dict}
              />
            )
        }
      </Container>
    );
  }
}

export default connect(
  state => state.data
)(Home);
