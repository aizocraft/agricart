import { useEffect } from 'react';

export const useDocumentMetadata = ({ title, description }) => {
  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.content;

    if (title) document.title = `${title} | AgriCart`;
    
    if (description) {
      if (metaDescription) {
        metaDescription.content = description;
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.head.appendChild(meta);
      }
    }
    
    return () => {
      document.title = originalTitle;
      if (metaDescription) {
        metaDescription.content = originalDescription;
      }
    };
  }, [title, description]);
};