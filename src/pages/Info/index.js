import React from 'react';
import { Container, Card } from 'semantic-ui-react';
import { getTranslation } from 'api/i18n';

const Info = () => {

  const linguistsContributorsRAN = [
    {
      header: getTranslation('Normanskaya Julia Viktorovna'),
      description: `${getTranslation('editor-in-chief of the website')}, ${getTranslation('responsible editor of Ural dictionaries')}`,
      href: 'http://iling-ran.ru/main/scholars/normanskaya',
    }
  ];

  const linguistsContributors = [
    {
      header: getTranslation('Dybo Anna Vladimirovna'),
      description: getTranslation('responsible editor of Altai dictionaries'),
      href: 'http://iling-ran.ru/main/scholars/dybo',
    }
  ];

  const developersContributors = [
    {
      header: getTranslation('Borisenko Oleg Dmitrievich'),
      description: getTranslation('development of the architecture and core of the system')
    },
    {
      header: getTranslation('Tapekhin Andrey Nikolaevich'),
      description: getTranslation('development of the system core')
    },
    {
      header: getTranslation('Bogomolov Igor Vladimirovich'),
      description: getTranslation('development of the system core')
    },
    {
      header: getTranslation('Beloborodov Ivan Borisovich'),
      description: getTranslation('computing modules of the system')
    },
    {
      header: getTranslation('Ipatov Stepan Anatolievich'),
      description: getTranslation('frontend')
    },
    {
      header: getTranslation('Zharov Andrey Anatolievich'),
      description: getTranslation('frontend')
    }
  ];

  const developersElecardMedContributors = [
    {
      header: getTranslation('Rozhkov Artyom Vladimirovich'),
      description: getTranslation('frontend')
    },
    {
      header: getTranslation('Naumova Alexandra Vladimirovna'),
      description: getTranslation('frontend')
    }
  ];

  const developersAdditionalContributors = [
    {
      header: getTranslation('Mikhail Oslon'),
      description: getTranslation('analysis of cognates, phonemes and allophones')
    },
    {
      header: getTranslation('Pavel Grashchenkov'),
      description: getTranslation('valence analysis')
    }
  ];

  return (
    <Container>
      <Container className="container-gray">
        <h3 className="creator-title">{getTranslation('Institute of Linguistics Russian Academy of Sciences')}, {getTranslation('Ivannikov Institute for System Programming of the Russian Academy of Sciences')}</h3>
        <Card.Group items={linguistsContributorsRAN} itemsPerRow={1} className="lingvo-cards-with-links" />
      </Container>
      <Container className="container-gray">
        <h3 className="creator-title">{getTranslation('Institute of Linguistics Russian Academy of Sciences')}, {getTranslation('Tomsk State University')}</h3>
        <Card.Group items={linguistsContributors} itemsPerRow={1} className="lingvo-cards-with-links" />
      </Container>
      <Container className="container-gray">
        <h3 className="creator-title">{getTranslation('Ivannikov Institute for System Programming of the Russian Academy of Sciences')}</h3>
        <Card.Group items={developersContributors} itemsPerRow={3} stackable className="lingvo-cards-without-links" />
      </Container>
      <Container className="container-gray">
        <h3 className="creator-title">{getTranslation('Elecard-Med LLC')}</h3>
        <Card.Group items={developersElecardMedContributors} itemsPerRow={2} stackable className="lingvo-cards-without-links" />
      </Container>
      <Container className="container-gray">
        <h3 className="creator-title">{getTranslation('Additional code')}</h3>
        <Card.Group items={developersAdditionalContributors} itemsPerRow={2} stackable className="lingvo-cards-without-links" />
      </Container>

      <Container className="container-gray">
        <h2 className="black">{getTranslation('Contacts')}</h2>
        <p>{getTranslation('Ask questions about the LingvoDoc program at')} <a href="mailto:al@somestuff.ru">al@somestuff.ru</a></p>
      </Container>
    </Container>
  )
};

export default (Info);
