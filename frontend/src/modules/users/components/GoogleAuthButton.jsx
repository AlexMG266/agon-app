import { useEffect, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

/**
 * Botón "Continuar con Google" a ancho completo.
 *
 * Google GSI renderiza el botón en un iframe y su prop `width` solo acepta
 * píxeles (los porcentajes no funcionan). Este componente mide el ancho real
 * de su contenedor y se lo pasa a `GoogleLogin` en píxeles, de modo que el
 * botón se adapta al formulario (mismo ancho que el resto de inputs).
 *
 * Solo debe usarse dentro de un <GoogleOAuthProvider> (montado en main.tsx
 * cuando VITE_GOOGLE_CLIENT_ID está configurado).
 */
const GoogleAuthButton = ({ onSuccess, onError, text = 'continue_with', disabled = false }) => {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(360);

    useEffect(() => {
        let observer = null;

        const measure = () => {
            if (containerRef.current) {
                const measured = containerRef.current.getBoundingClientRect().width;
                if (measured > 0) {
                    setWidth(Math.round(measured));
                }
            }
        };

        measure();

        if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(measure);
            if (containerRef.current) {
                observer.observe(containerRef.current);
            }
        } else {
            window.addEventListener('resize', measure);
        }

        return () => {
            if (observer) {
                observer.disconnect();
            } else {
                window.removeEventListener('resize', measure);
            }
        };
    }, []);

    return (
        <div ref={containerRef} style={{ width: '100%' }}>
            <GoogleLogin
                onSuccess={onSuccess}
                onError={onError}
                theme="outline"
                shape="pill"
                size="large"
                width={width}
                text={text}
                disabled={disabled}
                useOneTap={false}
            />
        </div>
    );
};

export default GoogleAuthButton;
