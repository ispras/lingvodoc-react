import React from 'react';
import PropTypes from 'prop-types';
import './styles.scss';
import imageLanguages from '../../images/book_lover.svg';
import imageTools from '../../images/noted.svg';
import imageDashboard from '../../images/responsive.svg';
import imageGrants from '../../images/winners.svg';
import imageCreators from '../../images/conference_call.svg';
import imageSupport from '../../images/connecting.svg';

import imageMain from '../../images/image_main.svg';

import imageAddFiles from '../../images/advantages_add_files.svg';
import imagePlanet from '../../images/advantages_planet.svg';
import imageSearch from '../../images/advantages_search.svg';
import imagePlayer from '../../images/advantages_player.svg';

import {Link} from 'react-router-dom';
import {getTranslation} from 'api/i18n';
import {compose} from 'recompose';
import {connect} from 'react-redux';
import Footer from 'components/Footer';
import { Accordion } from 'semantic-ui-react';

const panels = [
    {
        key: 'working-dictionaries',
        title: {
            className: 'lingvo-main-block__opportunities-list-title',
            content: "Работа со словарями",
            icon: (
                <i className="lingvo-icon-plus"></i>
            )
        },
        content: {
            className: 'lingvo-main-block__opportunities-list-content',
            content: (
                <ul className="lingvo-main-block__opportunities-full">
                    <li className="lingvo-main-block__opportunities-full-elem">
                        создание любых столбцов; добавление любого текста, аудиофайлов, разметки спектрограмм в фонетической программе Праат; создание этимологических связей между словами в разных словарях;
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                        возможность автоматической сегментации опроса носителей, подгруженного в Телеграмм-канал «Поддержка ЛингвоДок» на отдельные слова;
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                        программы обработки и анализа данных: фонетический анализ; поиск этимологий; анализ когнатов диалектов и нескольких языков; акустический анализ когнатов; фонологическое статистическое расстояние; фонематический анализ; реконструкция когнатов диалектов и нескольких языков.
                    </li>
                </ul>
            )
        }
    },
    {
        key: 'working-enclosures',
        title: {
            className: 'lingvo-main-block__opportunities-list-title',
            content: "Работа с корпусами текстов",
            icon: (
                <i className="lingvo-icon-plus"></i>
            )
        },
        content: {
            className: 'lingvo-main-block__opportunities-list-content',
            content: (
                <ul className="lingvo-main-block__opportunities-full">
                    <li className="lingvo-main-block__opportunities-full-elem">
                        загрузка аудиофайлов любого объема; (аудио) корпусов в формате Элан; текстов в формате Ворд.odt;
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                        автоматическое создание словарей из корпусов текстов;
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                        обработка с помощью парсеров: эрзянского, мокшанского, удмуртского, коми, казахского, татарского языков; возможность быстрого создания новых парсеров и их интеграции в ЛингвоДок;
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                        удобный интерфейс для он-лайн снятия вручную омонимии, возникшей после обработки текста парсером; 
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                        программы морфологического анализа глоссированных корпусов, в частности, автоматическое выявление моделей управления.
                    </li>
                </ul>
            )
        }
    },
    {
        key: 'mapping-ling-features',
        title: {
            className: 'lingvo-main-block__opportunities-list-title',
            content: "Картографирование лингвистических особенностей",
            icon: (
                <i className="lingvo-icon-plus"></i>
            )
        },
        content: {
            className: 'lingvo-main-block__opportunities-list-content',
            content: (
                <ul className="lingvo-main-block__opportunities-full">
                    <li className="lingvo-main-block__opportunities-full-elem">
                        поисковые запросы любого типа сложности и отражение их на карте;
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                        построение географических ареалов;
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                        вывод результатов в виде он-лайн фрагментов аудиословарей и корпусов с возможностью их редактирования и в формате файла Эксель; 
                    </li>

                    <li className="lingvo-main-block__opportunities-full-elem">
                        возможность сохранения построенной он-лайн карты в виде ссылки и ее автоматическое пополнение при добавлении новых материалов на ЛингвоДок.
                    </li>
                </ul>
            )
        }
    }
];

class topSectionSelector extends React.Component {
    render() {
        const {isAuthenticated} = this.props;

        return (
        <div className="lingvodoc-page">
            <div className="top-section-selector lingvodoc-page__content">

                <div className="background-main-page">
                    <div className="main-page">
                        <div className="top-section-selector_icon">
                            <Link className="card-item" to="/LanguagesDatabasesRoute">
                                <label className="card-item__label">{getTranslation('Languages databases')}</label>
                                <img className="card-item__img card-item__img_languages" src={imageLanguages} />
                            </Link>
                            <Link className="card-item" to="/toolsRoute">
                                <label className="card-item__label">{getTranslation('Tools')}</label>
                                <img className="card-item__img" src={imageTools} />
                            </Link>
                            {(isAuthenticated) && (
                                <Link className="card-item" to="/dashboardRoute">
                                    <label className="card-item__label">{getTranslation('Dashboard')}</label>
                                    <img className="card-item__img" src={imageDashboard} />
                                </Link>)}

                            <Link className="card-item" to="/grantsRoute">
                                <label className="card-item__label">{getTranslation('Grants')}</label>
                                <img className="card-item__img card-item__img_grants" src={imageGrants} />
                            </Link>
                            <Link className="card-item" to="/authors_route">
                                <label className="card-item__label">{getTranslation('Lingvodoc creators')}</label>
                                <img className="card-item__img card-item__img_creators" src={imageCreators} />
                            </Link>
                            <Link className="card-item" to="/supportRoute">
                                <label className="card-item__label">{getTranslation('Support')}</label>
                                <img className="card-item__img card-item__img_support" src={imageSupport} />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="lingvo-main-block">
                    <div className="lingvo-main-block__content">
                        <h2 className="lingvo-main-block__title">
                            Это ЛингвоДок. Лингвистическая платформа.
                        </h2>
                        <div className="lingvo-main-block__subtit lingvo-main-block__subtit_platform">
                            Предназначенная для составления, анализа и хранения словарей, корпусов и конкордансов различных языков и диалектов.
                        </div>

                        <div className="lingvo-main-block__platform">
                            <div className="lingvo-main-block__platform-photo">
                                <img className="lingvo-main-block__platform-img" src={imageMain} />
                            </div>
                            <div className="lingvo-main-block__platform-list">
                                
                                <div className="lingvo-main-block__platform-list-item">
                                    <strong className="lingvo-main-block__platform-strong">В настоящее время представлено <span className="lingvo-main-block__platform-text_violet">более 1000 аудиословарей</span> и <span className="lingvo-main-block__platform-text_violet">300 корпусов текстов</span> по диалектам языков народов мира.</strong>
                                </div>

                                <div className="lingvo-main-block__platform-list-item">
                                    <strong className="lingvo-main-block__platform-strong">Представлены <span className="lingvo-main-block__platform-text_violet">уникальные данные</span> по исчезающим языкам России.</strong>
                                    <div className="lingvo-main-block__platform-desc">
                                        Многие диалекты уже исчезли, и на ЛингвоДоке представлены архивные материалы, которые в настоящее время заштабелированы и недоступны.
                                    </div>
                                </div>

                                <div className="lingvo-main-block__platform-list-item">
                                    <strong className="lingvo-main-block__platform-strong">Записаны <span className="lingvo-main-block__platform-text_violet">исчезнувшие языки.</span></strong>
                                    <div className="lingvo-main-block__platform-desc">
                                        Например, восточно-мансийский, и те, которые находятся под угрозой исчезновения (осталось не более 10 носителей старше 60 лет).
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lingvo-main-block lingvo-main-block_advantages">
                    <div className="lingvo-main-block__content">
                        <h2 className="lingvo-main-block__title">
                            Преимущества платформы ЛингвоДок
                        </h2>

                        <div className="lingvo-main-block__advantages">
                            <div className="lingvo-main-block__advantages-item">
                                <img className="lingvo-main-block__advantages-img" src={imagePlanet} />
                                <div className="lingvo-main-block__advantages-text">
                                    Одновременная и независимая работа многих исследователей
                                </div>
                            </div>
                            <div className="lingvo-main-block__advantages-item">
                                <img className="lingvo-main-block__advantages-img" src={imageSearch} />
                                <div className="lingvo-main-block__advantages-text">
                                    Возможность автоматической проверки ошибок в обработанных данных
                                </div>
                            </div>
                            <div className="lingvo-main-block__advantages-item">
                                <img className="lingvo-main-block__advantages-img" src={imagePlayer} />
                                <div className="lingvo-main-block__advantages-text">
                                    Уникальные программы, воспроизводящие экспериментально-фонетическую, этимологическую и морфологическую работу исследователя в 100 раз быстрее
                                </div>
                            </div>
                            <div className="lingvo-main-block__advantages-item">
                                <img className="lingvo-main-block__advantages-img" src={imageAddFiles} />
                                <div className="lingvo-main-block__advantages-text">
                                    Возможность создания РИДов для<br /> отчетности и работы с материалом
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lingvo-main-block">
                    <div className="lingvo-main-block__content lingvo-main-block__opportunities">
                        <h2 className="lingvo-main-block__title">
                            Возможности
                        </h2>
                        <div className="lingvo-main-block__opportunities-info">
                            <div className="lingvo-main-block__opportunities-details">
                                Подробнее о применении этих опций в <a href="https://github.com/ispras/lingvodoc-react/wiki" target="_blank">https://github.com/ispras/lingvodoc-react/wiki</a>.
                            </div>
                        </div>

                        <div className="lingvo-main-block__opportunities-list">
                            <Accordion panels={panels} exclusive={false} fluid />
                        </div>

                    </div>
                </div>

            </div>
            <Footer />
        </div>
        );
    }
}

topSectionSelector.propTypes = {
    isAuthenticated: PropTypes.bool
};

topSectionSelector.defaultProps = {
    isAuthenticated: false
};

export default compose(
    connect(state => state.auth),
    connect(state => state.locale)
)(topSectionSelector);