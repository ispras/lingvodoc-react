import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, onlyUpdateForKeys } from 'recompose';
import Immutable from 'immutable';
import { Link } from 'react-router-dom';
import { Dropdown, Checkbox, Icon } from 'semantic-ui-react';
import { toggleDictionary } from 'ducks/home';

import config from 'config';

import './published.scss';

function toId(arr, prefix = null) {
  const joiner = prefix ? arr[prefix] : arr;
  return joiner.join('/');
}

const Perspective = ({ perspective: p }) => (
  <Dropdown.Item as={Link} to={`dictionary/${toId(p.get('parent_id'))}/perspective/${toId(p.get('id'))}`}>
    {/* Permissions are shown in desktop or proxy version only */}
    {(config.buildType === 'desktop' || config.buildType === 'proxy') && (
      <span>
        {p.get('view') && <Icon name="book" />}
        {p.get('edit') && <Icon name="edit" />}
        {p.get('publish') && <Icon name="external share" />}
        {p.get('limited') && <Icon name="privacy" />}
      </span>
    )}
    {p.get('translation')}
  </Dropdown.Item>
);

Perspective.propTypes = {
  perspective: PropTypes.instanceOf(Immutable.Map).isRequired,
};

const Dict = ({ dictionary, actions, selected }) => {
  const id = dictionary.get('id');
  const translation = dictionary.get('translation');
  const perspectives = dictionary.get('children');
  const authors = dictionary.getIn(['additional_metadata', 'authors']);
  const isDownloaded = dictionary.get('isDownloaded');
  const isChecked = selected.has(id);
  return (
    <li className="dict">
      {(config.buildType === 'desktop' || config.buildType === 'proxy') && (
        <Checkbox defaultChecked={isChecked} onChange={() => actions.toggleDictionary(id.toJS())} />
      )}
      {isDownloaded && <Icon name="download" />}
      <span className="dict-name">{translation}</span>
      {authors && <span className="dict-authors">({authors})</span>}
      {perspectives &&
        perspectives.valueSeq && (
          <Dropdown inline text={`View (${perspectives.size})`}>
            <Dropdown.Menu>
              {perspectives.valueSeq().map(pers => <Perspective key={pers.get('id')} perspective={pers} />)}
            </Dropdown.Menu>
          </Dropdown>
        )}
    </li>
  );
};

Dict.propTypes = {
  dictionary: PropTypes.instanceOf(Immutable.Map).isRequired,
  actions: PropTypes.shape({
    toggleDictionary: PropTypes.func.isRequired,
  }).isRequired,
  selected: PropTypes.instanceOf(Immutable.Set).isRequired,
};

const Dictionary = compose(
  connect(state => state.home, dispatch => ({ actions: bindActionCreators({ toggleDictionary }, dispatch) })),
  onlyUpdateForKeys(['selected'])
)(Dict);

const Language = ({ language }) => {
  const translation = language.get('translation');
  const children = language.get('children');
  return (
    <li className="lang">
      <span className="lang-name">{translation}</span>
      <ul>{children.map(n => <Node key={n.get('id')} node={n} />)}</ul>
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
  tree: PropTypes.instanceOf(Immutable.List).isRequired,
};

export default Tree;
