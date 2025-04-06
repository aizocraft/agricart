// src/components/EmptyState.jsx
import { Link } from 'react-router-dom';

export default function EmptyState({ title, description, actionText, actionLink }) {
  return (
    <div className="text-center py-16 px-4">
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      {description && <p className="mt-2 text-gray-600">{description}</p>}
      {actionText && actionLink && (
        <Link to={actionLink} className="mt-4 inline-block text-blue-600 hover:underline font-medium">
          {actionText}
        </Link>
      )}
    </div>
  );
}
