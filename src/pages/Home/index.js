import React from 'react';
import PropTypes from 'prop-types';
import { compose, withReducer } from 'recompose';
import { graphql, gql } from 'react-apollo';
import Immutable, { fromJS, Map } from 'immutable';
import { Link } from 'react-router-dom';
import { Container, Dropdown, Checkbox, List, Segment } from 'semantic-ui-react';
import { buildLanguageTree, assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';

import './published.scss';

const dictionaryWithPerspectivesQuery = gql`
  query DictionaryWithPerspectives {
    language_tree {
      id
      parent_id
      translation
      created_at
    }
    dictionaries {
      id
      parent_id
      translation
      status
      additional_metadata {
        authors
      }
    }
    perspectives {
      id
      parent_id
      translation
    }
    grants {
      id
      translation
      additional_metadata {
        participant
      }
    }
  }
`;

const Perspective = ({ perspective: p }) => (
  <Dropdown.Item as={Link} to="/persp">
    {p.get('translation')}
  </Dropdown.Item>
);

Perspective.propTypes = {
  perspective: PropTypes.instanceOf(Immutable.Map).isRequired,
};

const Dictionary = ({ dictionary }) => {
  const translation = dictionary.get('translation');
  const perspectives = dictionary.get('children');
  const authors = dictionary.getIn(['additional_metadata', 'authors']);
  return (
    <li className="dict">
      <span className="dict-name">{translation}</span>
      {authors && <span className="dict-authors">({authors})</span>}
      {perspectives &&
        perspectives.valueSeq && (
          <Dropdown inline text={`View (${perspectives.size})`}>
            <Dropdown.Menu>
              {perspectives.valueSeq().map(pers => <Perspective key={pers.id} perspective={pers} />)}
            </Dropdown.Menu>
          </Dropdown>
        )}
    </li>
  );
};

Dictionary.propTypes = {
  dictionary: PropTypes.instanceOf(Immutable.Map).isRequired,
};

const Language = ({ language }) => {
  const translation = language.get('translation');
  const children = language.get('children');
  return (
    <li className="lang">
      <span className="lang-name">{translation}</span>
      <ul divided relaxed>
        {children.map(n => <Node key={n.get('id')} node={n} />)}
      </ul>
    </li>
  );
};

Language.propTypes = {
  language: PropTypes.instanceOf(Immutable.Map).isRequired,
};

const Node = ({ node }) => {
  switch (node.get('type')) {
    case 'language':
      return <Language language={node} />;
    case 'dictionary':
      return <Dictionary dictionary={node} />;
    default:
      return <div>Unknown type</div>;
  }
};

Node.propTypes = {
  node: PropTypes.instanceOf(Immutable.Map).isRequired,
};

const Tree = ({ tree }) => <ul className="tree">{tree.map(e => <Node key={e.get('id')} node={e} />)}</ul>;

Tree.propTypes = {
  tree: PropTypes.instanceOf(Map).isRequired,
};

function AllDicts(props) {
  const {
    data: {
      loading, error, dictionaries, perspectives, language_tree: languages,
    },
  } = props;

  if (loading || error) {
    return null;
  }

  const languagesTree = buildLanguageTree(fromJS(languages));
  const publishedDictionaries = fromJS(dictionaries.filter(d => d.status === 'Published'));

  const tree = assignDictsToTree(
    buildDictTrees(fromJS({
      lexical_entries: [],
      perspectives,
      dictionaries: publishedDictionaries,
    })),
    languagesTree
  );

  return (
    <div>
      <Tree tree={tree} />
    </div>
  );
}

AllDicts.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
};

const AllDictsWithData = compose(graphql(dictionaryWithPerspectivesQuery))(AllDicts);

function restDictionaries(dicts, grants) {
  const grantedDicts = grants
    .flatMap(grant => grant.getIn(['additional_metadata', 'participant']) || new List())
    .toSet();
  return dicts.reduce((acc, dict, id) => (grantedDicts.has(id) ? acc : acc.push(dict)), new Immutable.List());
}

function GrantedDicts(props) {
  const {
    data: {
      loading, error, dictionaries, perspectives, grants, language_tree: languages,
    }, selected,
  } = props;

  if (loading || error) {
    return null;
  }

  const grantsList = fromJS(grants);
  const languagesTree = buildLanguageTree(fromJS(languages));
  // const publishedDictionaries = fromJS(dictionaries.filter(d => d.status === 'Published'));

  const dicts = fromJS(dictionaries)
    .reduce((acc, dict) => acc.set(dict.get('id'), dict), new Map())
    .map((d, id) => d.set('selected', !!selected.get(id) || false));

  // build grant trees
  const trees = grantsList.map((grant) => {
    // list of dictionary ids involved in this grant
    const dictIds = grant.getIn(['additional_metadata', 'participant']) || new List();
    const pickedDicts = dictIds.map(id => dicts.get(id));
    return {
      id: grant.get('id'),
      text: grant.get('translation'),
      tree: assignDictsToTree(
        buildDictTrees(fromJS({
          lexical_entries: [],
          perspectives,
          dictionaries: pickedDicts,
        })),
        languagesTree
      ),
    };
  });

  // build tree of dictionaries not included in grants
  const restTree = assignDictsToTree(
    buildDictTrees(fromJS({
      lexical_entries: [],
      perspectives,
      dictionaries: restDictionaries(dicts, grantsList),
    })),
    languagesTree
  );

  return (
    <div>
      <div>
        {trees.map(({ id, text, tree }) => (
          <div key={id} className="grant">
            <div className="grant-title">{text}</div>
            <Tree tree={tree} />
          </div>
        ))}
      </div>
      <div className="grant">
        <div className="grant-title">Индивидуальная работа</div>
        <Tree tree={restTree} />
      </div>
    </div>
  );
}

GrantedDicts.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  selected: PropTypes.instanceOf(Immutable.Map).isRequired,
};

const GrantedDictsWithData = compose(graphql(dictionaryWithPerspectivesQuery))(GrantedDicts);

// state: Map { grantMode: true, selected: Map { id: true } }
function selectedReducer(state, { type, payload }) {
  switch (type) {
    case 'TOGGLE_DICT':
      const id = fromJS(payload);
      return state.hasIn(['selected', id]) ? state.deleteIn(['selected', id]) : state.setIn(['selected', id], true);
    case 'RESET_DICTS':
      return state.set('selected', new Map());
    case 'TOGGLE_GRANTS_MODE':
      return state.get('grantsMode') ? state.set('grantsMode', false) : state.set('grantsMode', true);
    case 'SET_GRANTS_MODE':
      return state.set('grantsMode', payload);
    default:
      return state;
  }
}

const Home = (props) => {
  const { state, dispatch } = props;

  const grantsMode = state.get('grantsMode');
  const sortMode = grantsMode ? 'by grants' : 'by languages';
  return (
    <Container className="published">
      <Segment padded="very">
        <Checkbox
          toggle
          label={{ children: <div className="toggle-label">{sortMode}</div> }}
          defaultChecked={grantsMode}
          onChange={(e, v) => dispatch({ type: 'SET_GRANTS_MODE', payload: v.checked })}
        />
      </Segment>
      {grantsMode && <GrantedDictsWithData selected={state.get('selected')} />}
      {!grantsMode && <AllDictsWithData />}
    </Container>
  );
};

Home.propTypes = {
  state: PropTypes.instanceOf(Immutable.Map).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default compose(withReducer('state', 'dispatch', selectedReducer, fromJS({ grantsMode: true, selected: new Map() })))(Home);
