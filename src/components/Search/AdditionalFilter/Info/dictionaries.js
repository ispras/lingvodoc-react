import { getTranslation } from 'api/i18n';

const dictionariesInfo = (dictionaries) => {
  const result = `${dictionaries.length} ${getTranslation('items')}`;

  return `${getTranslation('Dictionaries')}: ${result}`;
};

export default dictionariesInfo;
