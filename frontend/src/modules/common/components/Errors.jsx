import { useIntl } from 'react-intl';

const Errors = ({ errors, onClose }) => {

    const intl = useIntl();

    if (!errors) {
        return null;
    }

    let globalError;
    let fieldErrors;

    if (errors.globalError) {
        globalError = errors.globalError;
    } else if (errors.fieldErrors) {
        fieldErrors = [];
        errors.fieldErrors.forEach(e => {
            let fieldName = intl.formatMessage({ id: `project.global.fields.${e.fieldName}` });
            fieldErrors.push(`${fieldName}: ${e.message}`);
        });
    }

    // Don't render if there's nothing to show (prevents empty red box)
    if (!globalError && !fieldErrors) {
        return null;
    }

    const containerStyle = {
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 8,
        padding: '0.5rem 0.75rem',
        fontSize: '0.8rem',
        color: '#991b1b',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        marginBottom: '0.75rem'
    };

    const closeBtnStyle = {
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: '#991b1b',
        fontSize: '0.9rem',
        flexShrink: 0,
        lineHeight: 1,
        opacity: 0.7,
        transition: 'opacity 0.15s ease'
    };

    return (
        <div style={containerStyle}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginTop: '0.1rem', flexShrink: 0 }}></i>
            <div style={{ flex: 1 }}>
                {globalError && <span>{globalError}</span>}
                {fieldErrors && (
                    <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                        {fieldErrors.map((fieldError, index) =>
                            <li key={index}>{fieldError}</li>
                        )}
                    </ul>
                )}
            </div>
            {onClose && (
                <button
                    onClick={() => onClose()}
                    style={closeBtnStyle}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                    aria-label="Cerrar"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            )}
        </div>
    );
};

export default Errors;
