import React from 'react';
import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import './styles.scss';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Card, Button } from 'semantic-ui-react';
import { getTranslation } from 'api/i18n';
import { compose } from 'recompose';


const news = gql`
        query news($is_visible:Boolean,$locale:String){
            news(is_visible:$is_visible, locale: $locale){
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
    const { user,selected } = props;
    return (
        <div>
            <h1>{getTranslation('All news')}</h1>
            <NewsItemApollo user={user} selected={selected} />
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
            query: news,
            variables: { 
                locale: this.props.selected.shortcut,
                is_visible:true},
        }).then(result => {
            this.setState({ newsArr: result.data.news })
         console.log(this.props.selected.shortcut)
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
                            <div className="description">{news_item.description}</div>
                            <div className="date_published">
                                <h3>{getTranslation('Date published')}</h3>
                                {news_item.date_published}

                            </div>
                            <div className="author">
                            <h3>{getTranslation('Author')}</h3>
                                {news_item.author}
                            </div>
                            {this.props.user.id === this.props.user.id /* news_item.author_id */ ? < div className='ui tree buttons'>
                                <Button basic color='green'>
                                    {getTranslation('Publish')}
                                </Button>
                                <Button basic color='green'>
                                    {getTranslation('Edit')}
                                </Button>
                                <Button basic color='red'>
                                    {getTranslation('Delete')}
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
export default compose( connect(state => state.user),
connect(state => state.locale)
)(NewsList)



