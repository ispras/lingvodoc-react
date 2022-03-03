import React from 'react';
import { getTranslation } from 'api/i18n';

const Footer = () => (
    <div className="lingvodoc-page__footer lingvodoc-footer">
        <div className="lingvodoc-footer__inner">
            Copyright © 2012-2022 &nbsp;<a href="https://iling-ran.ru" target="_blank">{getTranslation('Institute of Linguistics Russian Academy of Sciences')}</a>, <a href="https://ispras.ru" target="_blank">{getTranslation('Ivannikov Institute for System Programming of the Russian Academy of Sciences')}</a>
        </div>
    </div>
);

export default Footer;
