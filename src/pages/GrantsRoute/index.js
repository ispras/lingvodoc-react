import React from "react";
import { Link } from "react-router-dom";
import { Container } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { getTranslation } from "api/i18n";

import Footer from "components/Footer";

import imageOffGrant from "../../images/add_document.svg";
import imageGrants from "../../images/winners.svg";

import "./styles.scss";

const grants = gql`
  query grants {
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
  const {
    data: { grants }
  } = props;

  function correctDate(date) {
    const newDate = new Date(Number(date) * 1000);
    return newDate.getFullYear();
  }
  return (
    <div className="lingvodoc-page">
      <div className="background-cards lingvodoc-page__content">
        <div className="grantsRoute">
          <h2 className="grants-header">{getTranslation("Grants")}</h2>

          <div className="cards-list">
            <Link className="card-item" to="/grants">
              <label className="card-item__label">{getTranslation("Grants")}</label>
              <img className="card-item__img card-item__img_grants" src={imageGrants} />
            </Link>
            <Link className="card-item" to="/without_grants">
              <label className="card-item__label">{getTranslation("Off-grant projects")}</label>
              <img className="card-item__img card-item__img_offgrant" src={imageOffGrant} />
            </Link>
          </div>

          <Container className="container-gray">
            <h3 className="black">{getTranslation("Project funded by grants")}</h3>

            <Container className="container-white lingvo-container_margin-auto">
              <p>
                <b>
                  Внимание! Для доступа ко всем возможностям системы (в том числе совместному созданию и редактированию
                  словарей, их публикации, привязке метаданных к словарям, поиску с учетом геолокаций, загрузки словарей
                  из настольной версии программы) необходимо зарегистрироваться и войти в систему. Кнопки
                  регистрации/входа в систему находятся в правом верхнем углу страницы.
                </b>
              </p>
              <p>
                <Link to="/desktop">
                  Настольные приложения, связанные с системой, можно скачать в разделе Desktop software
                </Link>
              </p>
            </Container>

            <ul>
              {grants &&
                grants.map(grant => (
                  <li key={grant.id} style={{ margin: "0 0 5px 0" }}>
                    {`(${grant.issuer}  `}
                    {`${grant.grant_number})  `}
                    {`${grant.translation}  `}
                    {`${correctDate(grant.begin)}-${correctDate(grant.end)}  `}
                  </li>
                ))}
            </ul>
          </Container>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default graphql(grants)(grantsRoute);
