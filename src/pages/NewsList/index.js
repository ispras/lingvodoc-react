import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import './styles.scss';
import { Link } from 'react-router-dom';
import News from '../../components/News';
const published_news  = gql`
        query{
            published_news{
            news_id
            author
            title
            description
            }
     }`;


const NewsList = (props) => {
    const { data } = props;
    const { published_news  } = data;
    const NewsList = published_news.map(news => (
        <li key={news.news_id}>
            <h2>{news.title}</h2>
            <Link to="/published_news/${news.news_id}" component={News}></Link>
            {news.description}
        </li>
    ))
    return (
        <div>
            <h1>Все новости</h1>
            <ul>{NewsList}</ul>
        </div>
    )
}

const date = new Date();
console.log(date)
export default (graphql(published_news ))(NewsList);