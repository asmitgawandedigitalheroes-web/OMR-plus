import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TransformationsSection from '@/components/home/TransformationsSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transformations — OMR+',
  description: 'Real results from real OMR+ members. Privacy-protected transformation stories across Fat Loss, Muscle Building, and Summer Body programs.',
};

export default function TransformationsPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0B0B0B' }}>
      <Navbar />
      <main className="flex-1 pt-20">
        <TransformationsSection />
      </main>
      <Footer />
    </div>
  );
}
