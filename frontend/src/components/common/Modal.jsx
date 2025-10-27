function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0,0,0,0.6)',
        zIndex: 45,
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6 rounded-2xl shadow-2xl border border-opacity-20 relative"
        style={{
          background: 'var(--color-secondary)',
          color: 'var(--color-text)',
          borderColor: 'var(--color-accent)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:rotate-90"
          style={{
            background: 'var(--color-bg)',
            color: 'var(--color-text)'
          }}
          aria-label="Close modal"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
