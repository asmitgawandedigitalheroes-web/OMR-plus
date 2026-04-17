import { createClient } from '@supabase/supabase-js';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/home/HeroSection';
import ProgramsSection from '@/components/home/ProgramsSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import TransformationsSection from '@/components/home/TransformationsSection';
import PricingSection from '@/components/home/PricingSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ConsultationCTA from '@/components/home/ConsultationCTA';
import Footer from '@/components/layout/Footer';

// Fetch pricing plans at the server level — always fresh on every request
async function getPricingPlans() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await supabase
      .from('pricing_plans')
      .select('id, name, description, tagline, cta_text, price_sar, billing_type, features, is_featured, sort_order')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    const all = data ?? [];
    const sorted = [...all].sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return a.sort_order - b.sort_order;
    });
    return sorted.slice(0, 3);
  } catch {
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  const plans = await getPricingPlans();

  return (
    <div className="flex flex-col w-full bg-brand-black text-white">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />
        <ProgramsSection />
        <HowItWorksSection />
        <TransformationsSection />
        <PricingSection plans={plans} />
        <TestimonialsSection />
        <ConsultationCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
