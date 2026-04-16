import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ConsultationCTA from '@/components/home/ConsultationCTA';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Consultation — OMR+',
  description: 'Book your free consultation with an OMR+ coach. No commitment required — we\'ll assess your goals and match you to the right plan.',
};

export default function ConsultationPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0B0B0B' }}>
      <Navbar />
      <main className="flex-1 pt-20">
        <ConsultationCTA />
      </main>
      <Footer />
    </div>
  );
}
