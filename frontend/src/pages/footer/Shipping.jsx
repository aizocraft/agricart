// src/pages/footer/Shipping.jsx
import { ErrorBoundary } from 'react-error-boundary';
import { useTheme } from '../../contexts/ThemeContext';
import ErrorFallback from '../home/ErrorFallback';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

export default function Shipping() {
  const { currentTheme } = useTheme();

  useDocumentMetadata({
    title: 'Shipping Policy',
    description: 'Learn about our shipping options and delivery times.'
  });

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <main className={`min-h-screen py-12 px-6 sm:px-12 lg:px-24 bg-gradient-to-b ${currentTheme.secondaryBg} ${currentTheme.bg} ${currentTheme.text}`}>
        <section className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-6">Shipping Policy</h1>
          <p className="mb-6 leading-relaxed text-lg">
            At AgriCart, we aim to deliver fresh produce promptly and safely to your doorstep.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Shipping Methods</h2>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>Standard Shipping: Delivered within 3-5 business days.</li>
            <li>Express Shipping: Delivered within 1-2 business days.</li>
            <li>Local Pickup: Available for select farms and locations.</li>
          </ul>
          <h2 className="text-2xl font-semibold mb-4">Shipping Fees</h2>
          <p className="mb-6 leading-relaxed text-lg">
            Shipping fees vary based on your location and selected shipping method. Fees are calculated at checkout.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Tracking Your Order</h2>
          <p className="mb-6 leading-relaxed text-lg">
            Once your order ships, you will receive a tracking number via email.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="leading-relaxed text-lg">
            If you have any questions or concerns about shipping, please <a href="/contact" className="text-green-600 hover:underline">contact us</a>.
          </p>
        </section>
      </main>
    </ErrorBoundary>
  );
}
