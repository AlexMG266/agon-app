import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';

import { getMessages } from '../../../i18n';
import { getLocale } from '../selectors';

const AppIntlProvider = ({ children }) => {

    const locale = useSelector(getLocale);

    return (
        <IntlProvider key={locale} locale={locale} messages={getMessages(locale)}>
            {children}
        </IntlProvider>
    );

};

export default AppIntlProvider;
