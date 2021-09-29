import React from 'react';
import './styles.scss';
import { Link } from 'react-router-dom';
import imageCard from '../../images/cat.svg';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { getTranslation } from 'api/i18n';
import { Segment } from 'semantic-ui-react';

const grants = gql`
  query grants{
    grants {
      id
      begin
      end
      translation
      issuer
      grant_number
    }
  }
`;
function grantsRoute(props) {
  const { data: { grants } } = props;

  function correctDate(date) {
    const newDate = new Date(Number(date) * 1000);
    return newDate.getFullYear();
  }
  return (
    <div>
      <div className="grantsRoute">
        <h2 className="grants-header">{getTranslation('Grants')}</h2>

        <div className="cards-list">
          <Link className="card" to="/grants">
            <label className="card__label">{getTranslation('Grants')}</label>
            <img className="card__img" src={imageCard} />
          </Link>
          <Link className="card" to="/without_grants">
            <label className="card__label">{getTranslation('Off-grant projects')}</label>
            <img className="card__img" src={imageCard} />
          </Link>
        </div>
        <Segment>
          <h3 className="black">{getTranslation('Project funded by grants')}</h3>

          <Segment>
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
          </Segment>

          <ul>
            {(grants) && (grants.map(grant => (<li key={grant.id} style={{ margin: '0 0 5px 0' }} >
              {`(${grant.issuer}  `}
              {`${grant.grant_number})  `}
              {`${grant.translation}  `}
              {`${correctDate(grant.begin)}-${correctDate(grant.end)}  `}
            </li>)))}

          </ul>
        </Segment>
      </div>
    </div>
  );
}

export default graphql(grants)(grantsRoute);
