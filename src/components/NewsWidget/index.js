import React from 'react';
import './styles.scss';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { getTranslation } from 'api/i18n';


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
    const { data } = props;
    return (
        <div className='news-widget '>
            <h1> {getTranslation('News')}</h1>
            <main>
                <ul>
                    {data.loading ? null : data.news.slice(0, 3).map(news_item => (
                        <li key={news_item.news_id}>
                            <Link to={{ pathname: `/news/${news_item.news_id}`, props: news_item }}>{news_item.title}</Link>
                            {/*            <div className="date_published">{Date.stringify(news_item.date_published)}</div> */}
                            <div className="date_published">{news_item.date_published}</div>
                            <div className='description'> {news_item.description}</div>
                        </li>
                    ))}
                </ul>
                <Link to="/news_list">{getTranslation('All news')}</Link>
            </main>

        </div>
    )
}


export default graphql(news)(News);