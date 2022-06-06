import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "semantic-ui-react";
import { useQuery } from "@apollo/client";
import PropTypes from "prop-types";

import { getLanguagesForSearch } from "backend";
import Placeholder from "components/Placeholder";
import { useTranslations } from "hooks";
import { compositeIdToString } from "utils/compositeId";

/** Table of contents for languages */
const LanguagesToc = ({ queryLanguages, onSelectId }) => {
  const { chooseTranslation } = useTranslations();

  const [searchParams, setSearchParams] = useSearchParams();

  const { loading, error, data } = queryLanguages;

  const letterToLanguageMap = useMemo(() => {
    if (!data) {
      return new Map();
    }

    const { languages } = data;

    const language_toc_list = [];
    for (const language of languages) {
      if (!language.in_toc) {
        continue;
      }
      const language_extended = {
        dictionary_count: language.dictionary_count,
        id_str: compositeIdToString(language.id),
        translation: chooseTranslation(language.translations)
      };
      language_toc_list.push(language_extended);
    }
    language_toc_list.sort((language_a, language_b) => {
      const translation_a = language_a.translation;
      const translation_b = language_b.translation;
      const translation_a_lower = translation_a.toLocaleLowerCase();
      const translation_b_lower = translation_b.toLocaleLowerCase();
      if (translation_a_lower < translation_b_lower) {
        return -1;
      } else if (translation_a_lower > translation_b_lower) {
        return 1;
      } else if (translation_a < translation_b) {
        return -1;
      } else if (translation_a > translation_b) {
        return 1;
      }

      return 0;
    });

    const letter_map = new Map();
    for (const language of language_toc_list) {
      const letter = language.translation[0].toLocaleUpperCase();
      const language_list = letter_map.get(letter);
      if (!language_list) {
        letter_map.set(letter, [language]);
      } else {
        language_list.push(language);
      }
    }

    return letter_map;
  }, [chooseTranslation, data]);

  if (loading && !data) {
    return <Placeholder />;
  }

  if (error) {
    return null;
  }

  return (
    <Container className="container-gray container-gray_education langs-nav-list__wrap">
      <div className="langs-nav-list">
        {Array.from(letterToLanguageMap, ([letter, language_list]) => (
          <div key={letter} className="langs-nav-list__item">
            <div className="langs-nav-list__letter">{letter}</div>
            <ul className="langs-nav-list__item-list">
              {language_list.map((language, index) => (
                <li key={language.id_str} className="langs-nav-list__inner-item">
                  <button
                    className="langs-nav-list__button"
                    onClick={() => {
                      onSelectId(language.id_str);
                      searchParams.set("language", language.id_str);
                      setSearchParams(searchParams);
                    }}
                  >
                    {`${language.translation} [${language.dictionary_count}]`}
                  </button>
                  {index !== language_list.length - 1 ? ", " : ""}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Container>
  );
};

LanguagesToc.propTypes = {};

export default LanguagesToc;
