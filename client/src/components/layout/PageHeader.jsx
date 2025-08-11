import React from 'react';

const PageHeader = ({
  title,
  subtitle,
  children,
  breadcrumbs = [],
  className = '',
  ...props
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`} {...props}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="mb-2" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.path || index} className="flex items-center">
                  {index > 0 && (
                    <svg className="w-4 h-4 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  {crumb.path ? (
                    <a href={crumb.path} className="hover:text-gray-900 transition-colors">{crumb.label}</a>
                  ) : (
                    <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
            )}
            {subtitle && (
              <p className="mt-1 text-gray-600">{subtitle}</p>
            )}
          </div>
          {children && (
            <div className="flex items-center gap-2">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;