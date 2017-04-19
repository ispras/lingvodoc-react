import React from 'react';
import { pure } from 'recompose';
import { Link } from 'react-router-dom';
import { Container, Card } from 'semantic-ui-react';

const contributors = [
  {
    header: 'Юлия Викторовна Норманская',
    description: 'руководитель проекта',
    href: 'http://iling-ran.ru/beta/scholars/normanskaya',
  },
  {
    header: 'Анна Владимировна Дыбо',
    description: 'научный консультант проекта',
    href: 'http://iling-ran.ru/beta/scholars/dybo',
  },
  {
    header: 'Олег Борисенко',
    description: 'создатель программы LingvoDoc (API, backend)',
    href: 'http://www.ispras.ru/ru/modis/staff.php',
  },
  {
    header: 'Степан Ипатов',
    description: 'руководитель проекта',
    href: 'http://www.ispras.ru/ru/modis/staff.php',
  },
  {
    header: 'Руслан Идрисов',
    description: 'составитель корпуса бесермянского диалекта',
  },
  {
    header: 'Мария Константиновна Амелина',
    href: 'http://iling-ran.ru/beta/scholars/amelina',
  },
  {
    header: 'Семен Евгеньевич Шешенин',
    href: 'http://iling-ran.ru/beta/scholars/sheshenin',
  },
  {
    header: 'Мария Петровна Кайсина',
  },
];

const Info = pure(() =>
  <Container>
    <h3>Проект выполняется при финансовой поддержке грантов:</h3>
    <ul>
      <li>
        Президента РФ МД -7005.2015.6
        «Создание сравнительно-исторического диалектного аудиословаря уральских языков»,
        2015-2016 (рук. Ю.В. Норманская)
      </li>
      <li>
        РНФ № 15-18-00044
        «Информационная система для описания малочисленных языков народов мира.
          Создание описаний алтайских и уральских языков России, находящихся на грани исчезновения»,
        2015-2017 (рук. В.М. Алпатов)
      </li>
      <li>
        РГНФ № 15-04-00361
        «Первые памятники письменности на уральских и алтайских языках»,
        2015-2017 (рук. Ю.В. Норманская)
      </li>
    </ul>
    <p>
      <b>
        Внимание!
        Для доступа ко всем возможностям системы
        (в том числе совместному созданию и редактированию словарей, их публикации,
        привязке метаданных к словарям,
        поиску с учетом геолокаций, загрузки словарей из настольной версии программы)
        необходимо зарегистрироваться и войти в систему.
        Кнопки регистрации/входа в систему находятся в правом верхнем углу страницы.
      </b>
    </p>
    <p>
      <Link to="/desktop">Настольные приложения, связанные с системой, можно скачать в разделе Desktop software</Link>
    </p>

    <h2>Участники проекта</h2>
    <Card.Group items={contributors} itemsPerRow={4} />

    <h2>Контакты</h2>
    <p>Вопросы по поводу работы программы LingvoDoc задавайте по адресу <a href="mailto:al@somestuff.ru">al@somestuff.ru</a></p>
  </Container>
);

export default Info;
