import compositeIdToString from '../../utils/compositeId';

export default function languageListToTree(languages) {
  const hashTable = Object.create(null);
  languages.forEach(
    // eslint-disable-next-line no-return-assign
    language => hashTable[compositeIdToString(language.id)] = { ...language, languages: [] }
  );
  const tree = [];

  languages.forEach((language) => {
    const id = compositeIdToString(language.id);
    if (language.parent_id[0] !== null && language.parent_id[1] !== null) {
      const parentId = compositeIdToString(language.parent_id);
      hashTable[parentId].languages.push(hashTable[id]);
    } else {
      tree.push(hashTable[id]);
    }
  });
  return tree;
}
