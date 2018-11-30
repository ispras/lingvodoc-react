import { getTranslation } from 'api/i18n';
import info from './info';

const yearsInfo = (years) => {
  let result = '';

  if (years.length === 0) {
    result = info(getTranslation('Not chosen'));
  } else {
    result = info(years);
  }

  return `${getTranslation('Years')}: ${result}`;
};

export default yearsInfo;
