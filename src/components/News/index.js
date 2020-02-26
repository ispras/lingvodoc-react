import React from 'react';
import { Header } from 'semantic-ui-react'
import './styles.scss';
const NewsItem = (props) => {
    console.log(props, 'props news')
    return (
        <div className="news">
            <Header as='h1'>
                {props.location.props.title}
            </Header>
            <main>
                {props.location.props.text}
            </main>

        </div>
    )
}


export default (NewsItem);

