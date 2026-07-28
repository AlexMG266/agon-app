const Success = ({ message, onClose }) => {
    if (!message) {
        return null;
    }

    const containerStyle = {
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 8,
        padding: '0.5rem 0.75rem',
        fontSize: '0.8rem',
        color: '#166534',
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
        color: '#166534',
        fontSize: '0.9rem',
        flexShrink: 0,
        lineHeight: 1,
        opacity: 0.7,
        transition: 'opacity 0.15s ease'
    };

    return (
        <div style={containerStyle}>
            <i className="fa-solid fa-circle-check" style={{ marginTop: '0.1rem', flexShrink: 0 }}></i>
            <span style={{ flex: 1 }}>{message}</span>
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

export default Success;
