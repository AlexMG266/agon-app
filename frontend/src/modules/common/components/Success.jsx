import Alert from 'react-bootstrap/Alert';

const Success = ({message, onClose}) => message && (
    <Alert variant="success" onClose={() => onClose()} dismissible>
        {message}
    </Alert>
);

export default Success;
