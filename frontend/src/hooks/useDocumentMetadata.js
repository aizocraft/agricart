import { useEffect } from 'react';

export function useDocumentMetadata({ title, description }) {
  useEffect(() => {
    document.title = title || '';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = description || '';
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description || '';
      document.head.appendChild(meta);
    }
    
    return () => {
      document.title = '';
      if (metaDescription) {
        metaDescription.content = '';
      }
    };
  }, [title, description]);
}