import Immutable from 'immutable';
import { uniq } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';
import { buildLanguageTree, buildSearchResultsTree } from 'pages/Search/treeBuilder';

function buildPartialLanguageTree({
  lexicalEntries, allPerspectives, allDictionaries, allLanguages,
}) {
  const perspectiveCompositeIds = uniq(lexicalEntries.map(entry => entry.parent_id)).map(compositeIdToString);
  const perspectives = allPerspectives.filter(p => perspectiveCompositeIds.indexOf(compositeIdToString(p.id)) >= 0);
  const perspectiveParentCompositeIds = perspectives.map(p => compositeIdToString(p.parent_id));
  const dictionaries = allDictionaries.filter(d => perspectiveParentCompositeIds.indexOf(compositeIdToString(d.id)) >= 0);
  const dictionaryParentCompositeIds = dictionaries.map(d => compositeIdToString(d.parent_id));
  const seedLanguages = allLanguages.filter(lang => dictionaryParentCompositeIds.indexOf(compositeIdToString(lang.id)) >= 0);

  const reducer = (acc, lang) => {
    const id = compositeIdToString(lang.id);
    const parentIds = acc.filter(p => p.parent_id).map(p => compositeIdToString(p.parent_id));

    if (parentIds.indexOf(id) >= 0 && acc.map(p => compositeIdToString(p.id)).indexOf(id) < 0) {
      return [...acc, lang];
    }
    return acc;
  };

  let languages = seedLanguages;
  let prevLanguages = [];
  do {
    prevLanguages = languages;
    languages = allLanguages.reduce(reducer, prevLanguages);
  } while (prevLanguages.length !== languages.length);
  const treeData = Immutable.fromJS({ dictionaries, perspectives, lexical_entries: lexicalEntries });
  const languagesTree = buildLanguageTree(Immutable.fromJS(languages));

  return buildSearchResultsTree(treeData, languagesTree);
}

export default buildPartialLanguageTree;
