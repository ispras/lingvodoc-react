import React from "react";
import { Link } from "react-router-dom";
import { Container, Header, List, Segment } from "semantic-ui-react";
import { pure } from "recompose";

const Info = pure(() => (
  <Container>
    <Segment.Group>
      <Segment>
        <Header>1. Lingvodoc-desktop 0.9.9 (2012-2016)</Header>
        <p>
          Настольная программа для составления этимологических и медиасловарей с жестко зафиксированной структурой и без
          возможностей совместной работы. Поддерживает открытие пар звук-разметка в программе Praat из программы.
        </p>
        <p>
          Программа реализована на языке C++ с использованием фреймворка QT5 и представляет собой изолированное
          переносимое приложение. Система Lingvodoc (в которой Вы находитесь) поддерживает импорт файлов словарей из
          этой настольной программы в качестве источника данных.
        </p>
        <div>
          Разработка Института Системного Программирования РАН (<a href="http://ispras.ru/">http://ispras.ru/</a>)
        </div>
        <div>
          <a href="https://github.com/al-indigo/Dialeqt">Исходные коды</a>
        </div>
        <div>
          <a href="https://github.com/al-indigo/Dialeqt/releases/download/v0.9.10/LingvoDoc-0.9.10.zip">
            Сборка для ОС Windows
          </a>
        </div>
      </Segment>
      <Segment>
        <Header>2. Lingvodoc-desktop 2.1 (2017)</Header>
        <p>Настольная программа для составления словарей произвольной структуры с произвольными данными:</p>
        <List bulleted>
          <List.Item>текстовые данные,</List.Item>
          <List.Item>звуковые файлы,</List.Item>
          <List.Item>
            разметки TextGrid <a href="https://en.wikipedia.org/wiki/Praat">[Praat]</a> и Eaf{" "}
            <a href="https://tla.mpi.nl/tools/tla-tools/elan/">[Elan]</a>
          </List.Item>
          <List.Item>графические файлы</List.Item>
          <List.Item>направленные связи между лексическими входами</List.Item>
          <List.Item>ненаправленные группы связности между лексическими входами</List.Item>
          <List.Item>дополнительные документы, привязываемые к словарям</List.Item>
          <List.Item>геолокационные метки</List.Item>
          <List.Item>корпуса текстов</List.Item>
        </List>
        <div>
          Данная программа является клиентом к системе Lingvodoc (в которой Вы сейчас находитесь) и предоставляет
          большую часть возможностей серверной системы. Данная программа требует интернет-соединения при первом запуске
          программы, после чего работает полностью автономно до тех пор, пока пользователь не захочет синхронизировать
          свои данные с сервером. Программа также поддерживает разделение прав пользователей, позволяет скачивать
          доступные пользователю словари с сервера и работать с данными совместно, так же, как это происходит в
          серверной версии данной системы. Программа реализована на языках Python (с использованием фреймворков Pyramid,
          SQLAlchemy и других), Scala (фреймворк scala-js) и Javascript.
        </div>
        Дистрибутив программы представляет собой установочный файл для ОС Windows, начиная с Windows 7 и до Windows 10.
        Для установки необходимо установить системное обновление, доступное по{" "}
        <a href="https://github.com/ispras/lingvodoc/releases/download/v2.1/vcredist_x86.exe">этой ссылке</a>{" "}
        (необходима версия строго vcredist_x86.exe, даже если система x64_86).
        <div>
          Разработка Института Системного Программирования РАН (<a href="http://ispras.ru/">http://ispras.ru/</a>)
        </div>
        <div>
          <a href="https://github.com/ispras/lingvodoc">Исходные коды</a>
        </div>
        <div>
          <a href="https://github.com/ispras/lingvodoc/releases/download/v2.1/lingvodoc_setup.exe">
            Сборка для ОС Windows
          </a>
        </div>
        <div>
          В случае если у вас уже установлена более ранняя версия программы, скачайте, пожалуйста файлы (
          <a href="https://github.com/ispras/lingvodoc/releases/download/v2.1/update.bat">update.bat</a>,{" "}
          <a href="https://github.com/ispras/lingvodoc/releases/download/v2.1/pre_update.pyw">pre_update.pyw</a>),
          сохраните в папку с программой и запустите update.bat
        </div>
      </Segment>
    </Segment.Group>
  </Container>
));

export default Info;
