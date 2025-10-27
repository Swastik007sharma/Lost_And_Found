// src/components/common/Input.jsx
function Input({ className = '', error = false, ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500'
        } ${className}`}
      style={{
        border: error ? '1px solid #ef4444' : '1px solid var(--color-secondary)',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        ...(props.disabled && { background: 'var(--color-secondary)' })
      }}
      {...props}
    />
  );
}

export default Input;