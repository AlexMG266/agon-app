import { Link } from 'react-router';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

const ForbiddenPage = () => {
    return (
        <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <div className="text-center" style={{ maxWidth: '420px' }}>
                <div className="mb-3 text-secondary" style={{ fontSize: '2.5rem', lineHeight: '1', opacity: '0.3' }}>
                    <i className="fa-regular fa-circle-exclamation"></i>
                </div>
                <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.25rem', letterSpacing: '-0.01em' }}>
                    Acceso denegado
                </h2>
                <p className="text-secondary mb-2" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                    No tienes permisos para acceder a esta página.
                </p>
                <p className="text-secondary" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                    Puede que necesites iniciar sesión con una cuenta con permisos suficientes.
                </p>
                <Button as={Link} to="/" variant="dark" className="rounded-pill px-3 py-1 mt-2" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                    <i className="fa-solid fa-arrow-left me-2"></i>
                    Volver al inicio
                </Button>
            </div>
        </Container>
    );
};

export default ForbiddenPage;