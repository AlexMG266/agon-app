import {FormattedMessage} from 'react-intl';
import Container from 'react-bootstrap/Container';

const Footer = () => (

    <footer className="bg-light border-top text-center py-3 mt-auto">
        <Container>
            <FormattedMessage id="project.app.Footer.text"/>
        </Container>
    </footer>

);

export default Footer;
