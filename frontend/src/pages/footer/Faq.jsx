// src/pages/footer/Faq.jsx
import { ErrorBoundary } from 'react-error-boundary';
import { useTheme } from '../../contexts/ThemeContext';
import ErrorFallback from '../home/ErrorFallback';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

export default function Faq() {
  const { currentTheme } = useTheme();

  useDocumentMetadata({
    title: 'Frequently Asked Questions',
    description: 'Answers to common questions about AgriCart.'
  });

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <main className={`min-h-screen py-12 px-6 sm:px-12 lg:px-24 bg-gradient-to-b ${currentTheme.secondaryBg} ${currentTheme.bg} ${currentTheme.text}`}>
        <section className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-6">Frequently Asked Questions</h1>
          
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">How do I place an order?</h2>
            <p className="leading-relaxed text-lg">Browse products, add items to your cart, and proceed to checkout with your account.</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">What payment methods do you accept?</h2>
            <p className="leading-relaxed text-lg">We accept credit/debit cards, PayPal, and mobile money payments.</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Can I return a product?</h2>
            <p className="leading-relaxed text-lg">Yes, returns are accepted within 7 days of delivery if the product is faulty or damaged.</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">How do I track my order?</h2>
            <p className="leading-relaxed text-lg">You will receive a tracking number by email once your order ships.</p>
          </div>

        </section>
      </main>
    </ErrorBoundary>
  );
}
