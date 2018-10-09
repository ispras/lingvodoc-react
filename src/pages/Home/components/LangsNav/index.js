import React from 'react';
import PropTypes from 'prop-types';
import { compose, mapProps } from 'recompose';
import { Segment, Header } from 'semantic-ui-react';

import LangsNavAutocomplete from 'pages/Home/components/LangsNav/LangsNavAutocomplete/index';
import LangsNavList from 'pages/Home/components/LangsNav/LangsNavList/index';
import { sortLangsAlphabetically } from '../../common';

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
 *
 */
const languageSet = {
  'Altai language': '',
  'Altai-Kizhi dialect': '',
  'Altaic family': '',
  'Azeric': '',
  'Baltic-Finnish': '',
  'Bashkir': '',
  'Bonan': '',
  'Buryat language': '',
  'Chakhar': '',
  'Chalkan dialect': '',
  'Chuvash language': '',
  'Daghur': '',
  'Dariganga': '',
  'Dolgan language': '',
  'Enez': '',
  'Erzya': '',
  'Estonian': '',
  'Even': '',
  'Evenki': '',
  'Finnish': '',
  'Gagauz': '',
  'Hungarian': '',
  'Ingrian': '',
  'Japonic languages': '',
  'Japonic proper': '',
  'Japono-Koreanic subfamily': '',
  'Jurchen': '',
  'Kalmyk language': '',
  'Kamas': '',
  'Karaim': '',
  'Karakalpak': '',
  'Karelian': '',
  'Khakas': '',
  'Khalaj': '',
  'Khalkha': '',
  'Khamnigan Evenki': '',
  'Khanty': '',
  'Kokonur': '',
  'Komi': '',
  'Koreanic languages': '',
  'Kumandin': '',
  'Kur-Urmi Evenki': '',
  'Kyrgyz': '',
  'Livonian': '',
  'Manchu branch': '',
  'Manchu': '',
  'Mansi': '',
  'Mari': '',
  'Mator': '',
  'Middle-Chulym language (Budeev, Budeeva, Tamycheva, Tatynkina': '',
  'Moksha': '',
  'Mongolic languages': '',
  'Monguor': '',
  'Nanii': '',
  'Negidal language': '',
  'Negidal': '',
  'Nenez': '',
  'Nganasan': '',
  'Noghai': '',
  'North Tungus (Tungus proper languages': '',
  'Northern Mongolic': '',
  'Oghuz': '',
  'Ordos': '',
  'Oroch language': '',
  'Orok': '',
  'Qarachaj-Balkar language': '',
  'Qumyq language': '',
  'Qypčaq branch': '',
  'Ryukyuan': '',
  'Saami': '',
  'Salar': '',
  'Samoyed': '',
  'Santa': '',
  'Selkup': '',
  'Shor': '',
  'Solon language': '',
  'Tatar': '',
  'Telengit dialect': '',
  'Teleut dialect': '',
  'Tofa': '',
  'Tuba language': '',
  'Tungus-Manchu languages': '',
  'Tungusic': '',
  'Turkic languages': '',
  'Turkish': '',
  'Turkmenic': '',
  'Tuvan branch': '',
  'Udmurt': '',
  'Udyhe language': '',
  'Ulcha': '',
  'Uralic': '',
  'Uyghur': '',
  'Uzbek': '',
  'Veps': '',
  'Votic': '',
  'Xibe': '',
  'Yakut': '',
  'Yugur': '',
};

export const checkLanguage = (language) => {
  const atoms = language.translation_gist.translationatoms;
  var i = 0;

  for (; i < atoms.length; i++)
    if (atoms[i].locale_id == 2)
      return languageSet.hasOwnProperty(atoms[i].content);

  return false;
}

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
  <Segment>
    <Header as="h3">Выбор языка</Header>
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
