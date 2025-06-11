// src/pages/footer/Returns.jsx
import { ErrorBoundary } from 'react-error-boundary';
import { useTheme } from '../../contexts/ThemeContext';
import ErrorFallback from '../home/ErrorFallback';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

export default function Returns() {
  const { currentTheme } = useTheme();

  useDocumentMetadata({
    title: 'Returns & Refunds',
    description: 'Learn about our returns and refund policy.'
  });

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <main className={`min-h-screen py-12 px-6 sm:px-12 lg:px-24 bg-gradient-to-b ${currentTheme.secondaryBg} ${currentTheme.bg} ${currentTheme.text}`}>
        <section className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-6">Returns & Refunds</h1>
          <p className="mb-6 leading-relaxed text-lg">
            We want you to be fully satisfied with your purchase. If you are not happy, here is our returns and refunds policy.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Return Eligibility</h2>
          <p className="mb-6 leading-relaxed text-lg">
            Returns are accepted within 7 days of delivery for items that are faulty, damaged, or not as described.
          </p>
          <h2 className="text-2xl font-semibold mb-4">How to Return</h2>
          <p className="mb-6 leading-relaxed text-lg">
            Contact our customer support within the return window to initiate a return. Provide your order number and reason.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Refund Process</h2>
          <p className="mb-6 leading-relaxed text-lg">
            Once we receive and inspect the returned item, refunds will be processed within 5-7 business days to your original payment method.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="leading-relaxed text-lg">
            For any questions regarding returns, please <a href="/contact" className="text-green-600 hover:underline">contact us</a>.
          </p>
        </section>
      </main>
    </ErrorBoundary>
  );
}
