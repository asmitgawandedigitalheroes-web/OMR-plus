'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the AthloCode platform ("Service"), creating an account, or purchasing any coaching membership, program, or product, you agree to be legally bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use our Service.

These Terms apply to all users of the platform, including clients, coaches, and visitors. AthloCode reserves the right to update these Terms at any time. Continued use of the Service following any changes constitutes acceptance of the revised Terms. We will notify you of material changes via email or a prominent notice on our platform.`,
  },
  {
    title: '2. Description of Service',
    content: `AthloCode is a premium fitness coaching platform providing personalised nutrition and workout plans, one-on-one coaching, progress tracking, and related health and wellness services ("Coaching Services"). The platform operates exclusively online and is designed for individuals located in the UAE and broader GCC region.

AthloCode is an application-based membership service. Access is granted at our sole discretion following review of your application. We reserve the right to decline applications without obligation to provide reasons.

The platform also offers a marketplace for fitness-related digital products and supplements. Marketplace availability is subject to change.`,
  },
  {
    title: '3. Eligibility',
    content: `You must be at least 18 years of age to use AthloCode. By using the Service, you represent and warrant that:

• You are 18 years of age or older.
• You have the legal capacity to enter into a binding agreement.
• All information you provide is accurate, current, and complete.
• You are not prohibited by any applicable law from using the Service.

If you have any pre-existing medical conditions, injuries, or health concerns, you agree to consult a qualified physician before beginning any fitness or nutrition programme provided through AthloCode.`,
  },
  {
    title: '4. Account Registration & Security',
    content: `To access the platform, you must register for an account. You agree to provide accurate and complete information during registration and to keep this information updated.

You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. AthloCode will not be liable for any loss or damage arising from your failure to safeguard your login information.

You must notify us immediately at support@athlocode.com if you suspect any unauthorised use of your account. We reserve the right to suspend or terminate accounts that we believe have been compromised or used in violation of these Terms.`,
  },
  {
    title: '5. Subscription Plans & Billing',
    content: `AthloCode offers coaching memberships on a recurring subscription basis, as well as one-time purchases for individual plans. Current pricing is displayed on the Pricing page of our platform and is managed by our administrative team.

Subscriptions automatically renew at the end of each billing cycle unless cancelled before the renewal date. By providing your payment details, you authorise AthloCode (via our payment processor) to charge the applicable subscription fee at each renewal period.

Pricing is subject to change with advance notice. Any price changes will be communicated to existing members at least 14 days before taking effect.

All payments are processed in AED (UAE Dirham) unless otherwise stated. Supported payment methods include Visa, Mastercard, and Apple Pay.`,
  },
  {
    title: '6. Cancellation & Refund Policy',
    content: `You may cancel your subscription at any time through your account dashboard or by contacting us at support@athlocode.com. Cancellation will take effect at the end of your current billing cycle, and you will retain access to the platform until that date.

AthloCode operates a no-refund policy on subscription fees once a billing cycle has commenced. This is because coaching resources, personalised plans, and coach time are allocated upon subscription activation.

Exceptions may be considered on a case-by-case basis in extraordinary circumstances, at AthloCode's sole discretion. To request a refund consideration, contact support@athlocode.com within 48 hours of the charge.

For one-time programme purchases, refunds are not available once the digital content has been accessed or downloaded.`,
  },
  {
    title: '7. Coaching Services & Health Disclaimer',
    content: `AthloCode coaches are fitness professionals who provide personalised training and nutrition guidance. The information and plans provided through our platform are intended for general fitness and wellness purposes and do not constitute medical advice, diagnosis, or treatment.

You acknowledge that:

• Results vary between individuals and are not guaranteed.
• Fitness and nutrition programmes involve inherent physical risks.
• You are solely responsible for your own health and safety during any exercise or dietary programme.
• AthloCode is not a substitute for professional medical advice or treatment.

Before starting any programme, particularly if you have health conditions, injuries, or are pregnant, please consult a qualified healthcare provider. AthloCode shall not be liable for any injury, illness, or adverse health outcome arising from participation in our programmes.`,
  },
  {
    title: '8. User Responsibilities & Prohibited Conduct',
    content: `As a user of AthloCode, you agree to:

• Use the platform solely for lawful purposes.
• Provide honest and accurate health information to enable appropriate coaching.
• Communicate respectfully with coaches and platform staff.
• Not share, distribute, or resell any content, plans, or materials provided through the platform.
• Not attempt to access other users' accounts or data.
• Not use the platform to upload or transmit harmful, offensive, or illegal content.
• Not attempt to reverse-engineer, hack, or disrupt the platform.

Violation of these obligations may result in immediate suspension or termination of your account without refund.`,
  },
  {
    title: '9. Intellectual Property',
    content: `All content on the AthloCode platform — including but not limited to meal plans, workout programmes, written content, graphics, logos, and software — is the exclusive intellectual property of AthloCode and is protected by applicable copyright and intellectual property laws.

You are granted a limited, non-exclusive, non-transferable licence to access and use this content solely for your personal fitness purposes as a platform member. Any reproduction, redistribution, modification, or commercial use of our content without prior written consent is strictly prohibited.

User-submitted content (such as progress photos, measurements, and messages) remains your property. By submitting such content, you grant AthloCode a limited licence to use it internally for the purpose of delivering coaching services.`,
  },
  {
    title: '10. Privacy & Data Protection',
    content: `AthloCode takes your privacy seriously. The collection, use, and storage of your personal data is governed by our Privacy Policy, which forms part of these Terms and is incorporated by reference.

By using our platform, you consent to the collection and processing of your personal data as described in our Privacy Policy. We comply with applicable data protection laws and will never sell your personal information to third parties.

Please review our Privacy Policy at athlocode.com/privacy for full details on how we handle your data.`,
  },
  {
    title: '11. Marketplace Terms',
    content: `The AthloCode marketplace offers fitness supplements, healthy food products, and digital content. All marketplace purchases are subject to the following:

• Product descriptions are provided in good faith. We do not guarantee specific outcomes from use of any supplement or product.
• Physical products are subject to availability and shipping conditions.
• Digital products (eBooks, programmes) are non-refundable once accessed.
• AthloCode is not responsible for any adverse reactions to supplements — consult your healthcare provider before use.
• Marketplace availability, pricing, and product range may change at any time.`,
  },
  {
    title: '12. Limitation of Liability',
    content: `To the fullest extent permitted by applicable law, AthloCode and its officers, directors, employees, coaches, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to personal injury, loss of data, loss of revenue, or loss of goodwill, arising out of or related to your use of the Service.

AthloCode's total cumulative liability to you for any claims arising under these Terms shall not exceed the amount you paid to AthloCode in the three months preceding the claim.

This limitation applies regardless of the form of action (contract, tort, negligence, or otherwise) and even if AthloCode has been advised of the possibility of such damages.`,
  },
  {
    title: '13. Governing Law & Dispute Resolution',
    content: `These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates, specifically the laws of the Emirate of Dubai.

Any disputes arising out of or relating to these Terms or your use of the Service shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be submitted to the exclusive jurisdiction of the courts of Dubai, UAE.

AthloCode reserves the right to seek injunctive or other equitable relief in any court of competent jurisdiction.`,
  },
  {
    title: '14. Modifications to the Service',
    content: `AthloCode reserves the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice. This includes changes to features, pricing, membership tiers, and availability.

We will endeavour to provide reasonable notice of significant changes that materially affect active members. AthloCode shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.`,
  },
  {
    title: '15. Contact Us',
    content: `If you have any questions, concerns, or complaints regarding these Terms of Service, please contact us:

Email: support@athlocode.com
Platform: via the Contact page at athlocode.com/contact
WhatsApp: Available through the platform for members

We aim to respond to all enquiries within 2 business days.`,
  },
];

export default function TermsPage() {
  const lastUpdated = 'January 2026';
  const router = useRouter();

  return (
    <div style={{ background: '#0B0B0B', minHeight: '100vh', color: '#fff' }}>
      <Navbar />

      <style>{`
        .legal-page {
          padding: 6rem 1.5rem 5rem;
          max-width: 860px;
          margin: 0 auto;
        }
        .legal-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 1rem;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 100px;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(201,168,76,0.85);
          background: rgba(201,168,76,0.06);
          margin-bottom: 1.5rem;
        }
        .legal-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #fff;
          margin-bottom: 0.75rem;
          line-height: 1.1;
        }
        .legal-title span {
          color: #C9A84C;
        }
        .legal-meta {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.35);
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .legal-section {
          margin-bottom: 2.5rem;
          padding-bottom: 2.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .legal-section:last-child {
          border-bottom: none;
        }
        .legal-section-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #C9A84C;
          margin-bottom: 1rem;
          letter-spacing: -0.01em;
        }
        .legal-section-content {
          font-size: 0.88rem;
          line-height: 1.85;
          color: rgba(255,255,255,0.62);
          white-space: pre-line;
        }
        .legal-toc {
          background: rgba(201,168,76,0.04);
          border: 1px solid rgba(201,168,76,0.12);
          border-radius: 12px;
          padding: 1.5rem 1.75rem;
          margin-bottom: 3rem;
        }
        .legal-toc-title {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(201,168,76,0.6);
          margin-bottom: 1rem;
        }
        .legal-toc a {
          display: block;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          padding: 0.25rem 0;
          transition: color 0.2s;
        }
        .legal-toc a:hover {
          color: #C9A84C;
        }
        .legal-contact-box {
          background: rgba(201,168,76,0.06);
          border: 1px solid rgba(201,168,76,0.18);
          border-radius: 14px;
          padding: 1.5rem 1.75rem;
          margin-top: 3rem;
        }
        .legal-contact-box p {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
        }
        .legal-contact-box a {
          color: #C9A84C;
          text-decoration: none;
        }
        .legal-contact-box a:hover {
          text-decoration: underline;
        }
        @media (max-width: 640px) {
          .legal-page {
            padding: 5rem 1rem 4rem;
          }
        }
      `}</style>

      <div className="legal-page">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            marginBottom: '1.75rem',
            padding: '0.45rem 1rem 0.45rem 0.75rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 100,
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.78rem', fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(201,168,76,0.07)';
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.28)';
            e.currentTarget.style.color = '#C9A84C';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Go Back
        </button>

        {/* Header */}
        <div className="legal-badge">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          Legal
        </div>
        <h1 className="legal-title">Terms of <span>Service</span></h1>
        <p className="legal-meta">
          Last updated: {lastUpdated} &nbsp;·&nbsp; Effective for all AthloCode members and platform users &nbsp;·&nbsp; Jurisdiction: Dubai, UAE
        </p>

        {/* Intro */}
        <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: '2.5rem' }}>
          Please read these Terms of Service carefully before using the AthloCode platform. These Terms govern your access to and use of our coaching services, membership subscriptions, marketplace, and all platform features. By creating an account or making a purchase, you agree to be bound by these Terms.
        </p>

        {/* TOC */}
        <div className="legal-toc">
          <p className="legal-toc-title">Table of Contents</p>
          <div style={{ columns: '2', columnGap: '1.5rem' }}>
            {sections.map((s, i) => (
              <a key={i} href={`#section-${i}`}>{s.title}</a>
            ))}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, i) => (
          <div key={i} id={`section-${i}`} className="legal-section">
            <h2 className="legal-section-title">{section.title}</h2>
            <p className="legal-section-content">{section.content}</p>
          </div>
        ))}

        {/* Contact box */}
        <div className="legal-contact-box">
          <p style={{ fontWeight: 700, color: '#C9A84C', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Questions about these Terms?</p>
          <p>
            Contact our team at <a href="mailto:support@athlocode.com">support@athlocode.com</a> or visit our{' '}
            <a href="/contact">Contact page</a>. We are happy to clarify any aspect of these Terms.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
