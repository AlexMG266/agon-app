import {useNavigate} from 'react-router';
import {FormattedMessage} from 'react-intl';

const BackLink = () => {

    const navigate = useNavigate();
    
    return (

        <a onClick={() => navigate(-1)} href="#">
            <FormattedMessage id='project.global.buttons.back'/>
        </a>

    );

};

export default BackLink;
