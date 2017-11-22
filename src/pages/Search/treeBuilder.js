import { List, is } from 'immutable';

const parentGrouper = x => x.get('parent_id');

export function buildLanguageTree(data) {
  const byParentId = data.groupBy(parentGrouper);

  function innerBuild(lang) {
    const langId = lang.get('id');
    return lang
      .set('type', 'language')
      .set('children', byParentId.get(langId, new List()).map(innerBuild));
  }

  return byParentId.get(null).map(innerBuild);
}

export function buildDictTrees(data) {
  const byParentId = {
    entities: data.get('entities').groupBy(parentGrouper),
    lexical_entries: data.get('lexical_entries').groupBy(parentGrouper),
    perspectives: data.get('perspectives').groupBy(parentGrouper),
  };

  function buildEntity(e) {
    return e.set('type', 'entity');
  }

  function buildEntries(e) {
    const eId = e.get('id');
    return e
      .set('type', 'lexical_entries')
      .set('children', byParentId.entities.get(eId).map(buildEntity));
  }

  function buildPerpective(p) {
    const pId = p.get('id');
    return p
      .delete('tree')
      .set('type', 'perspective')
      .set('children', byParentId.lexical_entries.get(pId).map(buildEntries));
  }

  function buildDict(d) {
    const dId = d.get('id');

    return d
      .set('type', 'dictionary')
      .set('children', byParentId.perspectives.get(dId).map(buildPerpective));
  }

  return data.get('dictionaries').map(buildDict);
}

export function buildSearchResultsTree(data, languageTree) {
  const dictTrees = buildDictTrees(data);

  function innerBuild(lang) {
    const dicts = dictTrees.filter(d => is(d.get('parent_id'), lang.get('id')));
    const newChildren = lang.get('children').map(innerBuild).concat(dicts);

    const hasDicts = !dicts.isEmpty() || newChildren.some(x => x.get('hasDicts'));

    return lang
      .set('children', newChildren)
      .set('hasDicts', hasDicts);
  }

  const fullTree = languageTree.map(innerBuild);

  function withDictOnly(obj) {
    if (obj.get('type') !== 'language') {
      return List.of(obj);
    }

    if (obj.get('hasDicts')) {
      return List.of(obj.update('children', children => children.flatMap(withDictOnly)));
    }

    return new List();
  }

  const filteredTree = fullTree.flatMap(withDictOnly);

  return filteredTree;
}
