import { getTranslation } from 'api/i18n';
import info from './info';

const hasAudioInfo = (hasAudio) => {
  let result = '';

  if (hasAudio === null) {
    result = info(getTranslation('Not chosen'));
  } else {
    result = info(hasAudio);
  }

  return `Audio: ${result}`;
};

export default hasAudioInfo;
