import { Link } from 'react-router-dom';

function PageHeader({ title, actionLabel, actionPath, onClick }) {
  return (
    <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {actionLabel && (
        <div className="mt-3 sm:mt-0 sm:ml-4">
          {onClick ? (
            <button
              onClick={onClick}
              className="btn"
            >
              {actionLabel}
            </button>
          ) : (
            <Link
              to={actionPath}
              className="btn"
            >
              {actionLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default PageHeader;