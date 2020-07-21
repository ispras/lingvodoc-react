import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import Tree from 'pages/Home/components/Tree';
import Immutable, { fromJS } from 'immutable';
import { Button, Header, Image, Modal, Segment } from 'semantic-ui-react';
import Placeholder from 'components/Placeholder';

function createTree(data) {
  const tree = {
    0: {
      children: {}
    }
  };

  const rootParentsIds = data.filter(d => d.parent_id === null).map(d => d.id.join('_'));

  data.forEach((lang) => {
    tree[lang.id.join('_')] = { ...lang, children: {} };
  });
  data.forEach((lang) => {
    if (lang.parent_id !== null) {
      tree[lang.parent_id.join('_')].children[lang.id.join('_')] = tree[lang.id.join('_')];
    }
  });

  const re = {};

  rootParentsIds.forEach((d) => {
    re[d] = tree[d];
  });

  return re;
}


const Test = ({ props, dictionaries }) => {
  console.log(dictionaries);

  const t = Object.values(props).map((lang) => {
      console.log(dictionaries)
/*     const dic = dictionaries.map((el) => {
      if (lang.id === el.parent_id) {
        return console.log(lang,el);
      }
    }); */
    if (!lang.children) {
      return (
        <ul>
          <li key={lang.id.join('_')}>
            {lang.translation}
           
          </li>
        </ul>
      );
    }
    return (
      <ul>
        <li key={lang.id.join('_')}>
          {lang.translation}
          <Test props={lang.children} />
        </li>
      </ul>
    );
  });
  return t;
};


const Selector = (props) => {
  const {
    dictWithPersp: {
      dictionaries, language_tree, perspectives, loading
    }
  } = props;

  if (!loading) {
    const tree = createTree(language_tree);

    return (
      <div>
        <Segment>
          <Test props={tree} dictionaries={dictionaries} />
        </Segment>
      </div>
    );
  }


  if (loading) {
    return <Placeholder />;
  }
};

export default Selector;
