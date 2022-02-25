import React from 'react';
import { Container, Card } from 'semantic-ui-react';
import { getTranslation } from 'api/i18n';

const Info = () => {

  const linguistsContributorsRAN = [
    {
      /*header: 'Норманская Юлия Викторовна',*/
      header: getTranslation('Normanskaya Julia Viktorovna'),
      /*description: 'главный редактор сайта, ответственный редактор Уральских словарей',*/
      description: `${getTranslation('editor-in-chief of the website')}, ${getTranslation('responsible editor of Ural dictionaries')}`,
      href: 'http://iling-ran.ru/main/scholars/normanskaya',
    }
  ];

  const linguistsContributors = [
    {
      /*header: 'Дыбо Анна Владимировна',*/
      header: getTranslation('Dybo Anna Vladimirovna'),
      /*description: 'ответственный редактор Алтайских словарей',*/
      description: getTranslation('responsible editor of Altai dictionaries'),
      href: 'http://iling-ran.ru/main/scholars/dybo',
    }
  ];

  /*const linguistsContributorsTSU = [
  {
    header: 'Резанова Зоя Ивановна ',
    description: 'ответственный редактор корпусов русской речи тюркско-русских билингвов',
    href: 'https://persona.tsu.ru/Home/UserProfile/1040',
  },
  ];*/

  const developersContributors = [
    {
      /*header: 'Борисенко Олег Дмитриевич',*/
      header: getTranslation('Borisenko Oleg Dmitrievich'),
      /*description: 'разработка архитектуры и ядра системы'*/
      description: getTranslation('development of the architecture and core of the system')
    },
    {
      /*header: 'Тапехин Андрей Николаевич',*/
      header: getTranslation('Tapekhin Andrey Nikolaevich'),
      /*description: 'разработка ядра системы'*/
      description: getTranslation('development of the system core')
    },
    {
      /*header: 'Богомолов Игорь Владимирович',*/
      header: getTranslation('Bogomolov Igor Vladimirovich'),
      /*description: 'разработка ядра системы'*/
      description: getTranslation('development of the system core')
    },
    {
      /*header: 'Белобородов Иван Борисович',*/
      header: getTranslation('Beloborodov Ivan Borisovich'),
      /*description: 'вычислительные модули системы'*/
      description: getTranslation('computing modules of the system')
    },
    {
      /*header: 'Ипатов Степан Анатольевич',*/
      header: getTranslation('Ipatov Stepan Anatolievich'),
      /*description: 'фронтенд'*/
      description: getTranslation('frontend')
    },
    {
      /*header: 'Жаров Андрей Анатольевич',*/
      header: getTranslation('Zharov Andrey Anatolievich'),
      /*description: 'фронтенд'*/
      description: getTranslation('frontend')
    }
  ];

  const developersElecardMedContributors = [
    {
      /*header: 'Рожков Артём Владимирович',*/
      header: getTranslation('Rozhkov Artyom Vladimirovich'),
      /*description: 'фронтенд'*/
      description: getTranslation('frontend')
    },
    {
      /*header: 'Наумова Александра Владимировна',*/
      header: getTranslation('Naumova Alexandra Vladimirovna'),
      /*description: 'фронтенд'*/
      description: getTranslation('frontend')
    }
  ];

  const developersAdditionalContributors = [
    {
      /*header: 'Михаил Ослон',*/
      header: getTranslation('Mikhail Oslon'),
      /*description: 'анализ когнатов, фонем и аллофонов'*/
      description: getTranslation('analysis of cognates, phonemes and allophones')
    },
    {
      /*header: 'Павел Гращенков',*/
      header: getTranslation('Pavel Grashchenkov'),
      /*description: 'анализ валентностей'*/
      description: getTranslation('valence analysis')
    }
  ];

  return (
    <Container>
      <Container className="container-gray">
        {/*<h3 className="creator-title">Институт языкознания РАН, Институт системного программирования им. В.П. Иванникова РАН</h3>*/}
        <h3 className="creator-title">{getTranslation('Institute of Linguistics Russian Academy of Sciences')}, {getTranslation('Ivannikov Institute for System Programming of the Russian Academy of Sciences')}</h3>
        <Card.Group items={linguistsContributorsRAN} itemsPerRow={1} className="lingvo-cards-with-links" />
      </Container>
      <Container className="container-gray">
        <h3 className="creator-title">{getTranslation('Institute of Linguistics Russian Academy of Sciences')}, {getTranslation('Tomsk State University')}</h3>
        {/*<h3 className="creator-title">Институт языкознания РАН, Томский государственный университет</h3>*/}
        <Card.Group items={linguistsContributors} itemsPerRow={1} className="lingvo-cards-with-links" />
      </Container>
      {/*<Container className="container-gray">
        <h3 className="creator-title">Томский государственный университет</h3>
        <Card.Group items={linguistsContributorsTSU} itemsPerRow={1} />
      </Container>*/}
      <Container className="container-gray">
        {/*<h3 className="creator-title">Институт системного программирования им. В.П. Иванникова РАН</h3>*/}
        <h3 className="creator-title">{getTranslation('Ivannikov Institute for System Programming of the Russian Academy of Sciences')}</h3>
        <Card.Group items={developersContributors} itemsPerRow={3} stackable className="lingvo-cards-without-links" />
      </Container>
      <Container className="container-gray">
        {/*<h3 className="creator-title">ООО Элекард-Мед</h3>*/}
        <h3 className="creator-title">{getTranslation('Elecard-Med LLC')}</h3>
        <Card.Group items={developersElecardMedContributors} itemsPerRow={2} stackable className="lingvo-cards-without-links" />
      </Container>
      <Container className="container-gray">
        {/*<h3 className="creator-title">Дополнительный код</h3>*/}
        <h3 className="creator-title">{getTranslation('Additional code')}</h3>
        <Card.Group items={developersAdditionalContributors} itemsPerRow={2} stackable className="lingvo-cards-without-links" />
      </Container>

      <Container className="container-gray">
        {/*<h2 className="black">Контакты</h2>*/}
        <h2 className="black">{getTranslation('Contacts')}</h2>
        {/*<p>Вопросы по поводу работы программы LingvoDoc задавайте по адресу <a href="mailto:al@somestuff.ru">al@somestuff.ru</a></p>*/}
        <p>{getTranslation('Ask questions about the LingvoDoc program at')} <a href="mailto:al@somestuff.ru">al@somestuff.ru</a></p>
      </Container>
    </Container>
  )
};

export default (Info);
