import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "semantic-ui-react";
import { useQuery } from "@apollo/client";

import { getTocLanguages } from "backend";
import Placeholder from "components/Placeholder";
import { useTranslations } from "hooks";
import { compositeIdToString } from "utils/compositeId";

/** Table of contents for languages */
const LanguagesToc = () => {
  const { chooseTranslation } = useTranslations();

  const [searchParams, setSearchParams] = useSearchParams();

  const { loading, error, data } = useQuery(getTocLanguages, { fetchPolicy: "network-only" });
  const letterToLanguageMap = useMemo(() => {
    if (!data) {
      return new Map();
    }

    const { language_toc } = data;

    const language_toc_list = [];
    for (const language of language_toc) {
      const language_extended = { ...language, translation: chooseTranslation(language.translations) };
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

  if (loading) {
    return <Placeholder />;
  }

  if (error) {
    return null;
  }

  return (
    <Container className="container-gray container-gray_education langs-nav-list__wrap">
      <div className="langs-nav-list">
        {Array.from(letterToLanguageMap.keys()).map(letter => (
          <div key={letter} className="langs-nav-list__item">
            <div className="langs-nav-list__letter">{letter}</div>
            <ul className="langs-nav-list__item-list">
              {letterToLanguageMap.get(letter).map((language, index, arr) => (
                <li key={compositeIdToString(language.id)} className="langs-nav-list__inner-item">
                  <button
                    className="langs-nav-list__button"
                    data-id={language.id}
                    data-value={chooseTranslation(language.translations)}
                    onClick={() => {
                      searchParams.set("entity", compositeIdToString(language.id));
                      setSearchParams(searchParams);
                    }}
                  >
                    {`${language.translation} [${language.dictionary_count}]`}
                  </button>
                  {`${index !== arr.length - 1 ? ", " : ""}`}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default LanguagesToc;
