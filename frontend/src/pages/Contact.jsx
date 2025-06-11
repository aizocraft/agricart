import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTheme } from '../contexts/ThemeContext';
import ErrorFallback from './home/ErrorFallback';
import { useDocumentMetadata } from '../hooks/useDocumentMetadata';

export default function Contact() {
  const { currentTheme } = useTheme();

  useDocumentMetadata({
    title: 'Contact Us',
    description: 'Get in touch with the AgriCart team.'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    // Simulate form submission - replace with real API call if needed
    try {
      await new Promise(res => setTimeout(res, 1500));
      setSuccess('Thank you for reaching out! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setError('Failed to send message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <main className={`min-h-screen py-12 px-6 sm:px-12 lg:px-24 bg-gradient-to-b ${currentTheme.secondaryBg} ${currentTheme.bg} text-gray-800`}>
        <section className="max-w-3xl mx-auto">
          <h1 className={`text-4xl font-extrabold mb-6 ${currentTheme.text}`}>
            Contact Us
          </h1>
          <p className={`mb-8 leading-relaxed text-lg ${currentTheme.lightText}`}>
            Have questions, feedback, or want to collaborate? Send us a message!
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className={`block mb-2 font-semibold ${currentTheme.text}`}>
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${currentTheme.border} ${currentTheme.card} ${currentTheme.text}`}
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="email" className={`block mb-2 font-semibold ${currentTheme.text}`}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${currentTheme.border} ${currentTheme.card} ${currentTheme.text}`}
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="message" className={`block mb-2 font-semibold ${currentTheme.text}`}>
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                required
                value={formData.message}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${currentTheme.border} ${currentTheme.card} ${currentTheme.text}`}
                disabled={submitting}
              />
            </div>

            {success && (
              <p className="text-green-600 font-semibold">{success}</p>
            )}

            {error && (
              <p className="text-red-600 font-semibold">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`inline-block px-6 py-3 font-semibold rounded-md text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </section>
      </main>
    </ErrorBoundary>
  );
}
