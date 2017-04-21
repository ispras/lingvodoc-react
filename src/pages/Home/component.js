import React from 'react';
import PropTypes from 'prop-types';
import { is } from 'immutable';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Dropdown, Icon } from 'semantic-ui-react';

import { Perspective as PerspectiveModel } from 'api/perspective';
import { Dictionary as DictionaryModel } from 'api/dictionary';
import { requestPublished, selectors } from 'ducks/data';

import './published.scss';

const Perspective =
({
  perspective: p,
}) =>
  <Dropdown.Item as={Link} to={`dictionary/${p.urlFor('parent_')}/perspective/${p.url}`}>
    {p.translation} {p.authors && p.authors.content && ` (${p.authors.content})`}
  </Dropdown.Item>;

Perspective.propTypes = {
  perspective: PropTypes.instanceOf(PerspectiveModel).isRequired,
};

const Dictionary =
({
  dictionary,
  perspectives,
  history,
}) =>
  <div className="dict">
    <span title={history.join(' > ')} className="dict-name">{dictionary.translation}</span>
    {
      perspectives && perspectives.valueSeq &&
        <Dropdown inline text={`View (${perspectives.size})`}>
          <Dropdown.Menu>
            {
              perspectives.valueSeq().map(pers =>
                <Perspective
                  key={pers.url}
                  perspective={pers}
                />
              )
            }
          </Dropdown.Menu>
        </Dropdown>
      }
  </div>;

Dictionary.propTypes = {
  dictionary: PropTypes.instanceOf(DictionaryModel).isRequired,
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
        { history.map(s => <span key={s}>{s}</span>) }
      </span>
      {
        dicts.map(dictionary =>
          <Dictionary
            key={dictionary.url}
            perspectives={perspectives.get(dictionary.id)}
            history={history}
            dictionary={dictionary}
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

const LanguagesList = ({
  languages,
  perspectives,
}) => {
  if (languages.length === 0) {
    return null;
  }

  return (
    <div className="lang-list">
      {
        languages.map(lang =>
          <DictionaryList
            key={lang.url}
            perspectives={perspectives}
            {...lang}
          />
        )
      }
    </div>
  );
};

LanguagesList.propTypes = {
  languages: PropTypes.array.isRequired,
  perspectives: PropTypes.object.isRequired,
};

const Home = ({
  languages,
  perspectives,
  loading,
}) =>
  <Container className="published">
    <h2>Опубликованные словари {loading && <Icon name="spinner" loading />}</h2>
    <LanguagesList languages={languages} perspectives={perspectives} />
  </Container>;

Home.propTypes = {
  languages: PropTypes.array.isRequired,
  perspectives: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default Home;
