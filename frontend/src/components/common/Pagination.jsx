import Button from './Button';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const maxPages = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
  const endPage = Math.min(totalPages, startPage + maxPages - 1);
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-[var(--bg-color)] text-[var(--text-color)] hover:bg-[var(--secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </Button>
      {startPage > 1 && <span className="text-[var(--text-color)]">...</span>}
      {pages.map((page) => (
        <Button
          key={page}
          onClick={() => onPageChange(page)}
          className={
            page === currentPage
              ? 'bg-[var(--primary)] text-[var(--text-color)] hover:bg-blue-700'
              : 'bg-[var(--bg-color)] text-[var(--text-color)] hover:bg-[var(--secondary)]'
          }
        >
          {page}
        </Button>
      ))}
      {endPage < totalPages && <span className="text-[var(--text-color)]">...</span>}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-[var(--bg-color)] text-[var(--text-color)] hover:bg-[var(--secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </Button>
    </div>
  );
}

export default Pagination;