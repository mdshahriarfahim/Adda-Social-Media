// পুরো app জুড়ে একই স্টাইলের বাটন ব্যবহারের জন্য একটা reusable wrapper
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary | secondary | danger
  disabled = false,
  fullWidth = false,
}) => {
  const baseStyle = {
    padding: '8px 16px',
    borderRadius: 6,
    border: 'none',
    fontWeight: 600,
    fontSize: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
  };

  const variants = {
    primary: { background: '#1877f2', color: '#fff' },
    secondary: { background: '#e4e6eb', color: '#050505' },
    danger: { background: '#fa383e', color: '#fff' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...variants[variant] }}
    >
      {children}
    </button>
  );
};

export default Button;