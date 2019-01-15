import { getTranslation } from 'api/i18n';
import info from './info';

const humanSettlementInfo = (humanSettlement) => {
  let result = '';

  if (humanSettlement.length === 0) {
    result = info(getTranslation('Not chosen'));
  } else {
    result = info(humanSettlement);
  }

  return `${getTranslation('Settlement')}: ${result}`;
};

export default humanSettlementInfo;
