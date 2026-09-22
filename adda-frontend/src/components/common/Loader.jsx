// ডেটা লোড হওয়ার সময় দেখানোর জন্য সাধারণ স্পিনার
const Loader = ({ size = 32 }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: '3px solid #e4e6eb',
          borderTopColor: '#1877f2',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  );
};

export default Loader;