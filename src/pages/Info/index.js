import React from 'react';
import { Container, Segment, Header, Card } from 'semantic-ui-react';



const linguistsContributorsRAN = [
  {
    header: 'Норманская Юлия Викторовна',
    description: 'главный редактор сайта, ответственный редактор Уральских словарей',
    href: 'http://iling-ran.ru/main/scholars/normanskaya',
  }
];

const linguistsContributors = [
  {
    header: 'Дыбо Анна Владимировна',
    description: 'ответственный редактор Алтайских словарей',
    href: 'http://iling-ran.ru/main/scholars/dybo',
  }
];
const linguistsContributorsTSU = [
  {
    header: 'Резанова Зоя Ивановна ',
    description: 'ответственный редактор корпусов русской речи тюркско-русских билингвов',
    href: 'https://persona.tsu.ru/Home/UserProfile/1040',
  },
];
const developersContributors = [
  {
    header: 'Борисенко Олег Дмитриевич',
    description: 'разработка архитектуры и ядра системы'
  },
  {
    header: 'Тапехин Андрей Николаевич',
    description: 'разработка ядра системы'
  },
  {
    header: 'Богомолов Игорь Владимирович',
    description: 'разработка ядра системы'
  },
  {
    header: 'Белобородов Иван Борисович',
    description: 'вычислительные модули системы'
  },
  {
    header: 'Ипатов Степан Анатольевич',
    description: 'фронтенд'
  },
  {
    header: 'Жаров Андрей Анатольевич',
    description: 'фронтенд'
  }
];

const developersElecardMedContributors = [
  {
    header: 'Рожков Артём Владимирович',
    description: 'фронтенд'
  },
  {
    header: 'Наумова Александра Владимировна',
    description: 'фронтенд'
  }
];
const Info = () => { 
  return (
    <Container>
      <Segment>
        <Header color='blue'>Институт языкознания РАН, Институт системного программирования им. В.П.Иванникова РАН</Header>
        <Card.Group items={linguistsContributorsRAN} itemsPerRow={1} />
      </Segment>
      <Segment>
        <Header color='blue'>Институт языкознания РАН, Томский государственный университет</Header>
        <Card.Group items={linguistsContributors} itemsPerRow={1} />
      </Segment>
      <Segment>
        <Header color='blue'>Томский государственный университет</Header>
        <Card.Group items={linguistsContributorsTSU} itemsPerRow={1} />
      </Segment>
      <Segment>
        <Header color='blue'>Институт системного программирования им. В. П. Иванникова РАН</Header>
        <Card.Group items={developersContributors} itemsPerRow={3} />
      </Segment>
      <Segment>
        <Header color='blue'>ООО Элекард-Мед</Header>
        <Card.Group items={developersElecardMedContributors} itemsPerRow={2} />
      </Segment>
      <h2 className="black">Контакты</h2>
      <Segment>
        <p>Вопросы по поводу работы программы LingvoDoc задавайте по адресу <a href="mailto:al@somestuff.ru">al@somestuff.ru</a></p>
      </Segment>
    </Container>
  )
}

  ;

export default (Info);
