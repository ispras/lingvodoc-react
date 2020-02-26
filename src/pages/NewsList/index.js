import React from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import './styles.scss';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Card, Button } from 'semantic-ui-react';



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


const NewsList = (props) => {
    const { user } = props;
    return (
        <div>
            <h1>Все новости</h1>
            <NewsItemApollo user={user} />
        </div>
    )
}

class NewsItem extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            newsArr: []
        }
        this.queryNews = this.queryNews.bind(this)
        this.queryNews()
    }
    queryNews = () => {
        const { client } = this.props;

        client.query({
            query: news
        }).then(result => {

            this.setState({ newsArr: result.data.news })
        }
        )
    }
    render() {
        return (
            <div className='news_list'>{this.state.newsArr.map(news_item => (

                <li key={news_item.news_id}>
                    <Card>
                        <Card.Header><Link to={{ pathname: `/news/${news_item.news_id}`, props: news_item }}>{news_item.title}</Link></Card.Header>
                        <Card.Content extra>
                            <div className="description">     {news_item.description}</div>
                            <div className="date_published">
                                <h3>Дата публикации</h3>
                                {news_item.date_published}

                            </div>
                            {this.props.user.id === news_item.author_id ? < div className='ui two buttons'>
                                <Button basic color='green'>
                                    Опубликовать
                                    </Button>
                                <Button basic color='red'>
                                    Удалить
                                    </Button>
                            </div> : null}



                        </Card.Content>
                    </Card>

                </li>
            ))
            }</div>

        )
    }

}

const NewsItemApollo = withApollo(NewsItem);
export default connect(state => state.user)(NewsList)



