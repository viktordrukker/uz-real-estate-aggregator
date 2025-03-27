'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link'; // Use Link for navigation

interface PaginationControlsProps {
  currentPage: number;
  pageCount: number;
  total: number; // Total items matching filters
  pageSize: number;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  pageCount,
  total,
  pageSize,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('page', String(pageNumber));
    return `/?${params.toString()}`;
  };

  const startItem = total > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="mt-8 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <Link
          href={createPageURL(currentPage - 1)}
          className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${
            currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
          }`}
          aria-disabled={currentPage <= 1}
          tabIndex={currentPage <= 1 ? -1 : undefined}
        >
          Previous
        </Link>
        <Link
          href={createPageURL(currentPage + 1)}
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${
            currentPage >= pageCount ? 'pointer-events-none opacity-50' : ''
          }`}
          aria-disabled={currentPage >= pageCount}
          tabIndex={currentPage >= pageCount ? -1 : undefined}
        >
          Next
        </Link>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <Link
              href={createPageURL(currentPage - 1)}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
              }`}
              aria-disabled={currentPage <= 1}
              tabIndex={currentPage <= 1 ? -1 : undefined}
            >
              <span className="sr-only">Previous</span>
              {/* Heroicon: chevron-left */}
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </Link>

            {/* Page Numbers Logic */}
            {(() => {
              const pageNumbers = [];
              const maxPagesToShow = 5; // Max number of direct page links (excluding first/last/ellipses)
              const halfMaxPages = Math.floor(maxPagesToShow / 2);

              let startPage = Math.max(1, currentPage - halfMaxPages);
              let endPage = Math.min(pageCount, currentPage + halfMaxPages);

              // Adjust range if near the beginning or end
              if (currentPage - halfMaxPages < 1) {
                endPage = Math.min(pageCount, maxPagesToShow);
              }
              if (currentPage + halfMaxPages > pageCount) {
                startPage = Math.max(1, pageCount - maxPagesToShow + 1);
              }

              // Always show first page and ellipsis if needed
              if (startPage > 1) {
                pageNumbers.push(
                  <Link key={1} href={createPageURL(1)} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                    1
                  </Link>
                );
                if (startPage > 2) {
                  pageNumbers.push(<span key="start-ellipsis" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">...</span>);
                }
              }

              // Render page numbers in the calculated range
              for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(
                  i === currentPage ? (
                    <span key={i} aria-current="page" className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                      {i}
                    </span>
                  ) : (
                    <Link key={i} href={createPageURL(i)} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                      {i}
                    </Link>
                  )
                );
              }

              // Always show last page and ellipsis if needed
              if (endPage < pageCount) {
                if (endPage < pageCount - 1) {
                  pageNumbers.push(<span key="end-ellipsis" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">...</span>);
                }
                pageNumbers.push(
                  <Link key={pageCount} href={createPageURL(pageCount)} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                    {pageCount}
                  </Link>
                );
              }

              return pageNumbers;
            })()}

            <Link
              href={createPageURL(currentPage + 1)}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage >= pageCount ? 'pointer-events-none opacity-50' : ''
              }`}
              aria-disabled={currentPage >= pageCount}
              tabIndex={currentPage >= pageCount ? -1 : undefined}
            >
              <span className="sr-only">Next</span>
              {/* Heroicon: chevron-right */}
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;
