 import { ErrorBoundary } from 'react-error-boundary';
import { useTheme } from '../contexts/ThemeContext';
import ErrorFallback from './home/ErrorFallback';
import { useDocumentMetadata } from '../hooks/useDocumentMetadata';

export default function About() {
  const { currentTheme } = useTheme();

  useDocumentMetadata({
    title: 'About Us',
    description: 'Learn more about AgriCart and our mission.'
  });

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <main className={`min-h-screen py-12 px-6 sm:px-12 lg:px-24 bg-gradient-to-b ${currentTheme.secondaryBg} ${currentTheme.bg} text-gray-800`}>
        <section className="max-w-4xl mx-auto">
          <h1 className={`text-4xl font-extrabold mb-6 ${currentTheme.text}`}>
            About AgriCart
          </h1>
          <p className={`mb-6 leading-relaxed text-lg ${currentTheme.lightText}`}>
            AgriCart is dedicated to connecting farmers directly with consumers,
            providing fresh, local produce and promoting sustainable agriculture.
            Our platform empowers farmers by giving them better access to markets,
            and supports communities by delivering healthy food options.
          </p>
          <p className={`mb-6 leading-relaxed text-lg ${currentTheme.lightText}`}>
            Founded with a passion for local farming and transparency, we strive
            to build a trustworthy ecosystem where producers and consumers benefit
            equally.
          </p>
          <p className={`mb-6 leading-relaxed text-lg ${currentTheme.lightText}`}>
            Join us on this journey to make fresh food accessible, support small
            farmers, and foster sustainable growth in agriculture.
          </p>

          <h2 className={`text-2xl font-semibold mt-12 mb-4 ${currentTheme.text}`}>
            Our Values
          </h2>
          <ul className={`list-disc list-inside space-y-2 text-lg ${currentTheme.lightText}`}>
            <li>Transparency in farming and pricing</li>
            <li>Empowering local farmers</li>
            <li>Commitment to sustainability</li>
            <li>Community-driven growth</li>
            <li>Quality and freshness guaranteed</li>
          </ul>
        </section>
      </main>
    </ErrorBoundary>
  );
}
