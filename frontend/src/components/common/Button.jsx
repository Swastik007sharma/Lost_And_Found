function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-md bg-[var(--primary)] text-[var(--text-color)] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;