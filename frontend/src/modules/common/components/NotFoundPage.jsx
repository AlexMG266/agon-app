// src/modules/common/components/NotFoundPage.jsx
import { Link } from 'react-router';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

const NotFoundPage = () => {
    return (
        <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
                <div className="mb-4 text-secondary" style={{ fontSize: '2.5rem', lineHeight: '1', opacity: '0.3' }}>
                    <i className="fa-regular fa-compass"></i>
                </div>
                <h2 className="fw-bold text-dark mb-2" style={{ fontSize: '1.25rem', letterSpacing: '-0.01em' }}>
                    Página no encontrada
                </h2>
                <p className="text-secondary mb-1" style={{ fontSize: '0.85rem' }}>
                    La página que estás buscando no existe o ha sido movida.
                </p>
                <p className="text-secondary mb-4" style={{ fontSize: '0.8rem' }}>
                    Comprueba la dirección o vuelve al inicio.
                </p>
                <Button as={Link} to="/" variant="dark" className="rounded-pill px-4 py-2" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                    <i className="fa-solid fa-arrow-left me-2"></i>
                    Volver al inicio
                </Button>
            </div>
        </Container>
    );
};

export default NotFoundPage;