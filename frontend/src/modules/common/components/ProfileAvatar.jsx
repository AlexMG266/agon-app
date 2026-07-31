// src/modules/common/components/ProfileAvatar.jsx

const ProfileAvatar = ({ imageUrl, name, size = 40, className = '' }) => {
    const getInitials = (name) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    const getSizeStyles = () => {
        if (typeof size === 'number') {
            return {
                width: `${size}px`,
                height: `${size}px`,
                fontSize: `${size * 0.45}px`
            };
        }
        return {};
    };

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt="Profile"
                className={`profile-avatar-image ${className}`}
                style={getSizeStyles()}
            />
        );
    }

    return (
        <div 
            className={`profile-avatar-placeholder ${className}`}
            style={getSizeStyles()}
        >
            {getInitials(name)}
        </div>
    );
};

export default ProfileAvatar;