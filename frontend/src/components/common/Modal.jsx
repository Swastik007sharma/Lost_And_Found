function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow-lg">
        <button onClick={onClose} className="text-red-500 float-right">X</button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
