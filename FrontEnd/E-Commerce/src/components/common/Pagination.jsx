
// ================================================================
// Pagination.jsx — Convert từ bigspring Pagination.js
// Thay next/link → Link react-router-dom
// Thay href routing Next.js → onClick callback đơn giản hơn
// ================================================================
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav className="mb-4 mt-10 flex justify-center space-x-[10px]" aria-label="Pagination">

      {/* Prev */}
      <button
        onClick={() => hasPrev && onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className="inline-flex w-[42px] justify-center rounded-md bg-theme-light px-2 py-2
                   text-dark hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="mt-0.5 h-5 w-5" />
      </button>

      {/* Page numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`rounded-md px-4 py-2 transition ${
            page === currentPage
              ? "bg-primary text-white"
              : "bg-theme-light text-dark hover:bg-primary hover:text-white"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => hasNext && onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="inline-flex w-[42px] justify-center rounded-md bg-theme-light px-2 py-2
                   text-dark hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronRight className="mt-0.5 h-5 w-5" />
      </button>

    </nav>
  );
};

export default Pagination;
