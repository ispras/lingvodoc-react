import { is, List } from "immutable";

const parentGrouper = x => x.get("parent_id");

export function buildLanguageTree(data) {
  if (!data) {
    return new List();
  }

  const byParentId = data.groupBy(parentGrouper);
  function innerBuild(lang) {
    const langId = lang.get("id");
    return lang.set("type", "language").set("children", byParentId.get(langId, new List()).map(innerBuild));
  }

  if (byParentId.size <= 0) {
    return new List();
  }

  return byParentId.get(null).map(innerBuild);
}

export function buildDictTrees(data) {
  const byParentId = {
    lexical_entries: data.get("lexical_entries").groupBy(parentGrouper),
    perspectives: data.get("perspectives").groupBy(parentGrouper)
  };

  function buildEntries(e) {
    return e.set("type", "lexical_entries");
  }

  function buildPerpective(p) {
    const pId = p.get("id");
    const lexicalEntries = byParentId.lexical_entries.get(pId) || [];
    return p.delete("tree").set("type", "perspective").set("lexicalEntries", lexicalEntries.map(buildEntries));
  }

  function buildDict(d) {
    const dId = d.get("id");
    const perspectives = byParentId.perspectives.get(dId) || [];
    return d.set("type", "dictionary").set("children", perspectives.map(buildPerpective));
  }

  return data.get("dictionaries").map(buildDict);
}

export function assignDictsToTree(data, languageTree) {
  function innerBuild(lang) {
    const dicts = data.filter(d => is(d.get("parent_id"), lang.get("id")));
    const newChildren = lang.get("children").map(innerBuild).concat(dicts);

    const hasDicts = !dicts.isEmpty() || newChildren.some(x => x.get("hasDicts"));

    return lang.set("children", newChildren).set("hasDicts", hasDicts);
  }

  const fullTree = languageTree.map(innerBuild);

  function withDictOnly(obj) {
    if (obj.get("type") !== "language") {
      return List.of(obj);
    }

    if (obj.get("hasDicts")) {
      return List.of(obj.update("children", children => children.flatMap(withDictOnly)));
    }

    return new List();
  }

  const filteredTree = fullTree.flatMap(withDictOnly);

  return filteredTree;
}

export function buildSearchResultsTree(data, languageTree) {
  return assignDictsToTree(buildDictTrees(data), languageTree);
}
