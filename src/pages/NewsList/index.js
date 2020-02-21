import React from 'react';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import './styles.scss';
import { Link } from 'react-router-dom';
import News from '../../components/News';
import test from '../../components/News';
import { render } from 'enzyme';
const news = gql`
        query{
            news(is_visible:true){
            news_id
            author
            title
            description
            }
     }`;
class arr extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            test5: []
        }
        this.myFun=this.myFun.bind(this)
        this.myFun()
    }
    myFun = () => {
        const { client } = this.props;
        client.query({
            query: news
        }).then(result => {
            console.log('yes', result.data.news)
            this.setState({ test5: result.data.news })
        }
        )
    }
    render() {


        return (
            <div>{this.state.test5.map(news_one => (
                <li key={news_one.news_id}>
                    <h2>{news_one.title}</h2>
                    {/* <Link to="/news/${news.news_id}" component={News}></Link>
    {news.description} */}
                </li>
            ))}</div>
        )
    }

}




const Test = withApollo(arr)

const NewsList = () => {
    return (
        <div>
            <h1>Все новости</h1>
            <Test />
        </div>
    )
}

/* export default (graphql(news))(NewsList); */

export default NewsList



