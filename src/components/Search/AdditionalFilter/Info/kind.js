import { getTranslation } from 'api/i18n';
import info from './info';

const kindInfo = (kind) => {
  let result = '';

  if (kind === null) {
    result = info(getTranslation('Not chosen'));
  } else {
    result = info(kind);
  }

  return `${getTranslation('Data source')}: ${result}`;
};

export default kindInfo;
