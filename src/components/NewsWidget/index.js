import React from 'react';
import './styles.scss';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

const news = gql`
        query{
            news(is_visible:true, locale: "russian"){
            news_id
            author
            author_id
            title
            description
            text
            date_published
            }
     }`;
const News = (props) => {
    const {data} = props;
    return (
        <div className='news-widget '>
            <h1>Новости</h1>
            <main>
                <ul>
                    {data.loading  ? null : data.news.slice(0,3).map(news_item => (
                        <li key={news_item.news_id}>
                            <Link to={{ pathname: `/news/${news_item.news_id}`, props: news_item }}>{news_item.title}</Link>
                          <div className=' description'> {news_item.description}</div> 
                        </li>
                    ))}
                </ul>
                <Link to="/news_list">Все новости</Link>
            </main>
           
        </div>
    )
}


export default graphql(news)(News);