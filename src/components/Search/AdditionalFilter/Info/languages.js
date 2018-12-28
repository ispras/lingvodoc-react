import { getTranslation } from 'api/i18n';

const languagesInfo = (languages) => {
  const result = `${languages.length} ${getTranslation('items')}`;

  return `${getTranslation('Languages')}: ${result}`;
};

export default languagesInfo;
