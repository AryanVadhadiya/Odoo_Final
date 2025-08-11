import React from 'react';
import Button from '../ui/Button';

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  className = '',
  ...props
}) => {
  return (
    <div className={`bg-white border-b border-neutral-200 ${className}`} {...props}>
      <div className="container-responsive py-8">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-neutral-500">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <svg className="w-4 h-4 mx-2 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="hover:text-brand-ocean transition-colors duration-200"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className={index === breadcrumbs.length - 1 ? 'text-neutral-900 font-medium' : ''}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Header Content */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="mt-2 text-lg text-neutral-600 max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-3">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'primary'}
                  size={action.size || 'md'}
                  icon={action.icon}
                  iconPosition={action.iconPosition || 'left'}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  loading={action.loading}
                  className={action.className}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Page Header with back button
export const PageHeaderWithBack = ({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  actions = [],
  className = '',
  ...props
}) => {
  const allActions = [
    {
      label: backLabel,
      variant: 'ghost',
      size: 'sm',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      ),
      onClick: onBack,
    },
    ...actions,
  ];

  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      actions={allActions}
      className={className}
      {...props}
    />
  );
};

// Page Header with tabs
export const PageHeaderWithTabs = ({
  title,
  subtitle,
  tabs = [],
  activeTab,
  onTabChange,
  actions = [],
  className = '',
  ...props
}) => {
  return (
    <div className={`bg-white border-b border-neutral-200 ${className}`} {...props}>
      <div className="container-responsive py-8">
        {/* Header Content */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-2 text-lg text-neutral-600 max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-3">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'primary'}
                  size={action.size || 'md'}
                  icon={action.icon}
                  iconPosition={action.iconPosition || 'left'}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  loading={action.loading}
                  className={action.className}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        {tabs.length > 0 && (
          <div className="border-b border-neutral-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-brand-ocean text-brand-ocean'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                    }
                  `}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

PageHeader.displayName = 'PageHeader';
PageHeaderWithBack.displayName = 'PageHeaderWithBack';
PageHeaderWithTabs.displayName = 'PageHeaderWithTabs';

export default PageHeader;
