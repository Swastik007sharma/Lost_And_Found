function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2 border border-[var(--secondary)] rounded-md bg-[var(--bg-color)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:bg-[var(--bg-color)] disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export default Textarea;