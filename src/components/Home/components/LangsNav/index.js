import React from 'react';
import PropTypes from 'prop-types';
import { compose, mapProps } from 'recompose';
import { Segment, Header } from 'semantic-ui-react';

import LangsNavAutocomplete from 'components/Home/components/LangsNav/LangsNavAutocomplete/index';
import LangsNavList from 'components/Home/components/LangsNav/LangsNavList/index';
import { sortLangsAlphabetically } from '../../common';
import { getTranslation } from 'api/i18n';


/*
 * Used for filtering languages based on a list provided by Julia Normanskaya.
 *
 * Filtering is performed by checking name of the language in the 2nd locale --- we assume that it changes
 * rarely, if anytime at all, but yeah, if the name of one of the permitted languages changes, the code
 * should be updated.
 *
 * Languages and their names (names in parenthesis indicate that the system does not have the language
 * currently, and the name is the best guess):
 *
 *  1. Proto-Uralic: "Uralic"
 *  1.1. Proto-Finno-Ugric: ()
 *  1.2. Proto-Samoyedic: "Samoyed"
 *  1.2.1. Nenets: "Nenez"
 *  1.2.2. Enets: "Enez"
 *  1.2.3. Nganasan: "Nganasan"
 *  1.2.4. Selkup: "Selkup"
 *  1.2.5. Mator: ("Mator")
 *  1.2.6. Kamassian: "Kamas"
 *  1.1.1. Proto-Ugric: ()
 *  1.1.1.1. Proto-Ob-Ugric: ()
 *  1.1.1.2. Hungarian: "Hungarian"
 *  1.1.1.1.1. Khanty: "Khanty"
 *  1.1.1.1.2. Mansi: "Mansi"
 *  1.1.2. Proto-Finno-Permic: ()
 *  1.1.2.1. Proto-Permic: ()
 *  1.1.2.1.1. Komi: "Komi"
 *  1.1.2.1.2. Udmurt: "Udmurt"
 *  1.1.2.2. Proto-Volga-Finnic: ()
 *  1.1.2.2.1. Mari: "Mari"
 *  1.1.2.2.2 The Mordvinic languages: ()
 *  1.1.2.2 2.1. Erzya: "Erzya"
 *  1.1.2.2.2.2. Moksha: "Moksha"
 *  1.1.2.2.3. Proto-Finno-Samic: ()
 *  1.1.2.2.3.1. The Sami languages: "Saami"
 *  1.1.2.2.3.2. The Baltic Finnish languages: "Baltic-Finnish"
 *  1.1.2.2.3.2.1. Finnish: "Finnish"
 *  1.1.2.2.3.2.2. Karelian: "Karelian"
 *  1.1.2.2.3.2.3. Ingrian: ("Ingrian")
 *  1.1.2.2.3.2.4. Veps: "Veps"
 *  1.1.2.2.3.2.5. Votic: ("Votic")
 *  1.1.2.2.3.2.6. Estonian: ("Estonian")
 *  1.1.2.2.3.2.7. Livonian: ("Livonian")
 *
 *  2. Proto-Altaic: "Altaic family"
 *  2.1. Proto-Japanese-Korean: "Japono-Koreanic subfamily"
 *  2.1.1. Proto-Japonic: "Japonic languages"
 *  2.1.1.1. Japanese: "Japonic proper"
 *  2.1.1.2. Ryukyuan: ("Ryukyuan")
 *  2.1.2. Korean "Koreanic languages"
 *  2.2. Proto-Tungus-Manchu "Tungus-Manchu languages"
 *  2.2.1. Proto-Manchu "Manchu branch"
 *  2.2.1.1. Manchu: ("Manchu")
 *  2.2.1.2. Jurchen: ("Jurchen")
 *  2.2.1.3. Xibe: "Xibe"
 *  2.2.2. Proto-Tungusic: "Tungusic"
 *  2.2.2.1. Orok: "Orok"
 *  2.2.2.2. Ulch: "Ulcha"
 *  2.2.2.3. Nanai: "Nanii"
 *  2.2.2.4. Proto-Northern Tungusic: "North Tungus (Tungus proper) languages"
 *  2.2.2.4.1. Oroch: "Oroch language"
 *  2.2.2.4.2. Udege: "Udyhe language"
 *  2.2.2.4.3. Negidal: "Negidal language", "Negidal"
 *  2.2.2.4.4. Kur-Urmi: "Kur-Urmi Evenki"
 *  2.2.2.4.5. Evenki: "Evenki"
 *  2.2.2.4.6. Even: "Even"
 *  2.2.2.4.7. Solon: "Solon language"
 *  2.3. Proto-Mongolic: ()
 *  2.3.1. Kokonur: ("Kokonur")
 *  2.3.1. Bonan: ("Bonan")
 *  2.3.2. Santa: ("Santa")
 *  2.3.3. Monguor: ("Monguor")
 *  2.3.2. The proper Mongolic languages: "Mongolic languages"
 *  2.3.2.1. The Southern Mongolic languages: ()
 *  2.3.2.1.1. Eastern Yugur: ("Yugur")
 *  2.3.2.1.2. Daghur: ("Daghur")
 *  2.3.2.2. The Northern Mongolian languages: "Northern Mongolic"
 *  2.3.2.2.1. Kalmyk Oirat: "Kalmyk language"
 *  2.3.2.2.2. Buryat: "Buryat language"
 *  2.3.2.2.3. Khamnigan: "Khamnigan Evenki"
 *  2.3.2.2.4. The Inner Mongolia dialects: ()
 *  2.3.2.2.5. Ordos: ("Ordos")
 *  2.3.2.2.6. Chakhar: ("Chakhar")
 *  2.3.2.2.7. Dariganga: ("Dariganga")
 *  2.3.2.2.8. Khalkha: ("Khalkha")
 *  2.4. Proto-Turkic: "Turkic languages"
 *  2.4.1. Chuvash: "Chuvash language"
 *  2.4.2. Common Turkic: ()
 *  2.4.2.1. Proto-Yakut-Dolgan: ()
 *  2.4.2.1.1. Yakut: "Yakut"
 *  2.4.2.1.2. Dolgan: "Dolgan language"
 *  2.4.2.2. Proto-Sayan: ()
 *  2.4.2.2.1. Tuvan: "Tuvan branch"
 *  2.4.2.2.2. Tofa: "Tofa"
 *  2.4.2.3. Proto-Kyrgyz: ()
 *  2.3.2.3.1. Khakass: "Khakas"
 *  2.3.2.3.2. Shor: "Shor"
 *  2.3.2.3.3. Chulym: "Middle-Chulym language (Budeev, Budeeva, Tamycheva, Tatynkina)"
 *  2.3.2.3.4. Western Yugur: ()
 *  2.3.2.3.5. The Fuyu Kyrgyz language: ()
 *  2.4.2.4. Proto-Kypchak: "Qypčaq branch"
 *  2.4.2.4.1. Karaim: ("Karaim")
 *  2.4.2.4.2. Karachay-Balkar: "Qarachaj-Balkar language"
 *  2.4.2.4.3. Kumyk: "Qumyq language"
 *  2.4.2.4.4. Bashkir: "Bashkir"
 *  2.4.2.4.5. Tatar: "Tatar"
 *  2.4.2.4.6. Nogai: "Noghai"
 *  2.4.2.4.6. Karakalpak: ("Karakalpak")
 *  2.4.2.4.7. The Uzbek Kypchak dialects: ()
 *  2.4.2.5. Proto-Karluk: ()
 *  2.4.2.5.1. Khalaj: ("Khalaj")
 *  2.4.2.5.2. Modern Uyghur: ("Uyghur")
 *  2.4.2.5.3. Uzbek: "Uzbek"
 *  2.4.2.6. Proto-Central-Eastern: ()
 *  2.4.2.6.1. Kumandy: "Kumandin"
 *  2.4.2.6.2. Chalkan: "Chalkan dialect"
 *  2.4.2.6.3. Tuba: "Tuba language"
 *  2.4.2.6.4. Teleut: "Teleut dialect"
 *  2.4.2.6.5. Telengit: "Telengit dialect"
 *  2.4.2.6.6. Altai-Kizhi: "Altai-Kizhi dialect"
 *  2.4.2.6.7. Altai: "Altai language"
 *  2.4.2.6.8. Kyrgyz: ("Kyrgyz")
 *  2.4.2.7. Proto-Oghuz: "Oghuz"
 *  2.4.2.7.1. Gagauz: ("Gagauz")
 *  2.4.2.7.2. Turkish: ("Turkish")
 *  2.4.2.7.3. Salar: ("Salar")
 *  2.4.2.7.4. Khwarezmian Uzbek: ()
 *  2.4.2.7.5. Iranian Oghuz: ()
 *  2.4.2.7.6. Turkmen: "Turkmenic"
 *  2.4.2.7.7. Azeri: "Azeric"
 */
export const languageIdList = [
  [1574, 116655], // Altai
  [33, 88], // Altai language
  [252, 40], // Altai-Kizhi dialect
  [1076, 4], // Altaic family
  [1574, 269058], // Azeric
  [1068, 5], // Baltic-Finnish
  [500, 121], // Bashkir
  [1076, 22], // Buryat language
  [33, 90], // Chalkan dialect
  [216, 8], // Chulym
  [1574, 272286], // Chuvash
  [295, 8], // Chuvash language
  [1100, 4], // Crimean Tatar
  [1105, 28], // Dolgan language
  [508, 49], // Enets
  [508, 39], // Erzya
  [633, 23], // Evenki
  [1552, 1252], // Finnish
  [508, 46], // Hungarian
  [1733, 13468], // Izhor
  [1501, 42640], // Japonic languages
  [1501, 42646], // Japonic proper
  [1311, 23], // Japono-Koreanic subfamily
  [1076, 10], // Kalmyk language
  [1552, 652], // Kamas
  [508, 37], // Karelian
  [500, 124], // Kazakh
  [500, 123], // Khakas
  [1574, 269111], // Khamnigan Evenki
  [508, 44], // Khanty
  [508, 42], // Komi
  [1076, 119], // Korean
  [1574, 99299], // Kur-Urmi Evenki
  [1574, 274491], // Manchu branch
  [508, 45], // Mansi
  [508, 41], // Mari
  [508, 40], // Moksha
  [1076, 7], // Mongolic languages
  [633, 17], // Nanii
  [1209, 24], // Negidal
  [1209, 20], // Negidal language
  [508, 48], // Nenets
  [508, 50], // Nganasan
  [1088, 612], // Noghai
  [1311, 41], // Northern Mongolic
  [1574, 203685], // Oghuz
  [1479, 599], // Oroch language
  [996, 1069], // Orok
  [1401, 11742], // Qara-Nogay
  [1574, 272495], // Qarachaj-Balkar language
  [998, 5], // Qumyq language
  [1574, 116715], // Qypčaq branch
  [508, 38], // Saami
  [508, 47], // Samoyed
  [1372, 10768], // Seber-Tatar
  [508, 51], // Selkup
  [1557, 6], // Shor
  [1574, 268977], // Solon language
  [500, 122], // Tatar
  [65, 2], // Telengit dialect
  [1251, 6], // Tofa
  [1574, 116679], // Tuba language
  [633, 16], // Tungus-Manchu languages
  [1002, 12], // Tungusic
  [1068, 9], // Turkic languages
  [1574, 269088], // Turkish
  [1574, 203688], // Turkmenic
  [1550, 3373], // Tuva
  [508, 43], // Udmurt
  [643, 4], // Udyhe language
  [33, 89], // Ujguri language
  [633, 22], // Ulcha
  [508, 36], // Uralic
  [840, 6], // Uzbek
  [1632, 6], // Veps
  [1372, 11240], // Volga Tatar
  [2108, 13], // Votic
  [1574, 274494], // Xibe
  [678, 9], // Yakut
];

const languageSet = languageIdList.reduce((object, id) => {
  const objectId = object;
  objectId[`${id}`] = '';
  return objectId;
}, {});

export const checkLanguage = language => languageSet.hasOwnProperty(`${language.id}`);

export const checkLanguageId = id => languageSet.hasOwnProperty(`${id}`);

/* ----------- COMPONENT HELPERS ----------- */
const prepareData = (resultData, language) => {
  const resultDictsCount = {
    dicts: 0,
    corps: 0,
  };

  // counting all dictionaries
  if (language.children.length > 0) {
    language.children.forEach((item) => {
      if (item.type === 'dictionary') {
        if (item.category === 0) {
          resultDictsCount.dicts += 1;
        } else if (item.category === 1) {
          resultDictsCount.corps += 1;
        }
      } else if (item.type === 'language') {
        const itemDictsCount = prepareData(resultData, item);

        resultDictsCount.dicts += itemDictsCount.dicts;
        resultDictsCount.corps += itemDictsCount.corps;
      }
    });
  }

  // eslint-disable-next-line no-param-reassign
  language.dictsCount = resultDictsCount;

  if (language.type === 'language') {
    resultData.push(language);
  }

  return resultDictsCount;
};

const makeLetterMap = data => data.reduce((acc, cur) => {
  const letter = cur.translation[0].toLocaleUpperCase();

  if (acc[letter]) {
    acc[letter].push(cur);
  } else {
    acc[letter] = [cur];
  }

  return acc;
}, {});

/* ----------- ENHANCERS ----------- */
const propsHandler = mapProps(({ data, ...rest }) => {
  const preparedData = [];

  data.toJS().forEach(language => prepareData(preparedData, language));
  preparedData.sort(sortLangsAlphabetically);

  const filteredData = preparedData.filter(checkLanguage);
  const listData = Object.entries(makeLetterMap(filteredData));

  return {
    ...rest,
    autocompleteData: preparedData,
    listData,
  };
});

const enhance = compose(propsHandler);

/* ----------- COMPONENT ----------- */
const LangsNav = ({ autocompleteData, listData }) => (
  <Segment className="rose_background!!!!!!!">
    <Header as="h3">{getTranslation('Select language')}</Header>
    <LangsNavAutocomplete data={autocompleteData} />
    <LangsNavList data={listData} />
  </Segment>
);

/* ----------- PROPS VALIDATION ----------- */
LangsNav.propTypes = {
  autocompleteData: PropTypes.array.isRequired,
  listData: PropTypes.array.isRequired,
};

export default enhance(LangsNav);
