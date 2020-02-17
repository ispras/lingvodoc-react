import React from 'react';
import './styles.scss';


const NewsEditor = () => {
    return (
        <div className='news_editor'>
            <h1 className='header'>Редактор новостей</h1>
            <h3 className='header'>Превью новости</h3>
            <textarea className='add_header' ></textarea>
            <button>Добавить картинку</button>
            <h3 className='header'>Текст новости</h3>
            <textarea className='add_news'></textarea>
            <button>Добавить </button>
        </div>
    )
}


export default NewsEditor;