import {FormattedMessage} from 'react-intl';
import Pagination from 'react-bootstrap/Pagination';

const Pager = ({back, next}) => (

    <Pagination className="justify-content-center">
        <Pagination.Prev disabled={!back.enabled} onClick={back.onClick}>
            <FormattedMessage id='project.global.buttons.back'/>
        </Pagination.Prev>
        <Pagination.Next disabled={!next.enabled} onClick={next.onClick}>
            <FormattedMessage id='project.global.buttons.next'/>
        </Pagination.Next>
    </Pagination>

);

export default Pager;
