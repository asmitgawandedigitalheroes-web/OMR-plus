import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works — OMR+',
  description: 'See how OMR+ premium fitness coaching works — from your free consultation to your personalised plan and ongoing results.',
};

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0B0B0B' }}>
      <Navbar />
      <main className="flex-1 pt-20">
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  );
}
