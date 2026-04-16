'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const sections = [
  {
    title: '1. Introduction',
    content: `AthloCode ("we", "us", "our") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, store, and protect your data when you use the AthloCode platform at athlocode.com and any associated services ("Platform").

This policy applies to all users of the Platform, including clients, coaches, and visitors. By using our Platform or creating an account, you consent to the data practices described in this Privacy Policy.

If you have questions or concerns about this policy or our data practices, please contact us at support@athlocode.com.`,
  },
  {
    title: '2. Information We Collect',
    content: `We collect information in the following categories:

Account & Profile Information
• Full name, email address, phone number
• Date of birth and gender
• Profile photo (optional)
• Language preference (English or Arabic)

Health & Fitness Information (provided voluntarily for coaching purposes)
• Body measurements (weight, height, body fat percentage)
• Fitness goals and activity level
• Dietary preferences, restrictions, and allergies
• Health conditions and medical history (relevant to fitness)
• Progress photos and InBody scan PDFs (uploaded by you)

Payment Information
• Billing name and address
• Payment card details (processed and stored securely by our payment processor — we do not store full card numbers on our servers)
• Transaction and subscription history

Usage & Technical Data
• IP address and device type
• Browser type and operating system
• Pages visited, time spent, and platform interactions
• Log files and error reports

Communications
• Messages exchanged with your assigned coach via the platform
• Support requests and email correspondence`,
  },
  {
    title: '3. How We Use Your Information',
    content: `We use the information we collect to:

Core Service Delivery
• Create and manage your AthloCode account
• Assign a coach and deliver personalised meal and workout plans
• Enable real-time communication between you and your coach
• Track and display your fitness progress

Subscription & Billing
• Process membership payments and one-time purchases
• Manage subscription renewals, upgrades, and cancellations
• Issue invoices and billing notifications
• Handle payment disputes and refund requests

Platform Improvement
• Monitor and improve platform performance and user experience
• Detect and prevent fraud, abuse, and security threats
• Conduct internal analytics to enhance our coaching services
• Fix technical issues and bugs

Communications
• Send account notifications (signup, billing, plan updates)
• Respond to support requests
• Deliver important service updates and policy changes

We do NOT use your data for unsolicited marketing, and we do NOT sell your personal information to any third party.`,
  },
  {
    title: '4. Health Data & Sensitivity',
    content: `AthloCode handles health and fitness data with the highest level of care. The health information you provide — including body measurements, dietary restrictions, medical history, and progress photos — is:

• Collected solely for the purpose of delivering personalised coaching services
• Accessible only to you and your assigned coach (and, in aggregate/anonymised form, to platform administrators for service management purposes)
• Never sold, shared, or disclosed to third parties for commercial purposes
• Stored with encryption and access controls in compliance with our security standards

You have the right to delete your health data at any time by contacting us at support@athlocode.com. Deletion requests will be processed within 30 days.`,
  },
  {
    title: '5. Data Storage & Security',
    content: `Your data is stored using Supabase, a secure cloud database platform hosted on AWS infrastructure with enterprise-grade security standards. Key security measures include:

• Row-Level Security (RLS): Database-level access controls ensure users can only access their own data
• Encryption at rest and in transit (TLS/SSL)
• Secure authentication managed by Supabase Auth
• Regular automated database backups
• Access logging and audit trails

Payment data is handled by our payment processor (Stripe or equivalent). Cardholder data is transmitted directly to the payment processor and is subject to PCI DSS compliance standards. AthloCode does not store, process, or transmit full card numbers on our own servers.

Despite our robust security measures, no online platform can guarantee absolute security. We encourage you to use a strong, unique password and to report any suspicious activity immediately.`,
  },
  {
    title: '6. Cookies & Tracking Technologies',
    content: `AthloCode uses cookies and similar technologies to improve your experience on our platform. Types of cookies we use:

Essential Cookies
Required for the platform to function correctly — including authentication sessions, language preferences, and security tokens. These cannot be disabled.

Preference Cookies
Store your settings such as language selection (English/Arabic) and display preferences.

Analytics Cookies
Help us understand how users interact with the platform so we can improve it. We use privacy-respecting analytics tools and do not track you across third-party websites.

You can manage cookie preferences through your browser settings. Note that disabling essential cookies may prevent you from using certain platform features.`,
  },
  {
    title: '7. Sharing of Information',
    content: `We share your information only in the following limited circumstances:

With Your Coach
Your assigned coach can view your profile, health data, meal plan history, workout history, and messages to deliver coaching services.

With Payment Processors
Payment details are shared with our payment processor (e.g., Stripe) solely for the purpose of processing transactions.

With Service Providers
We may share limited data with trusted third-party service providers (e.g., cloud infrastructure, email delivery) who assist us in operating the platform. These providers are bound by strict data processing agreements.

For Legal Compliance
We may disclose information if required by applicable law, court order, or government authority, or if necessary to protect the rights, safety, or property of AthloCode or its users.

Business Transfer
In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction. We will notify you of any such change.

We do NOT share your personal or health information with advertisers, data brokers, or any other commercial third parties.`,
  },
  {
    title: '8. Your Rights & Choices',
    content: `You have the following rights regarding your personal data:

Access: Request a copy of the personal data we hold about you.
Correction: Update or correct inaccurate information via your account settings or by contacting us.
Deletion: Request deletion of your account and associated personal data. Health data deletion requests are processed within 30 days.
Portability: Request your data in a machine-readable format where technically feasible.
Objection: Object to the processing of your data for specific purposes.
Withdraw Consent: Where processing is based on consent, you may withdraw it at any time.

To exercise any of these rights, contact us at support@athlocode.com. We will respond within 30 days. Identity verification may be required before we can process your request.

Language Rights: You may communicate with us in either English or Arabic. Our platform fully supports both languages.`,
  },
  {
    title: '9. Data Retention',
    content: `We retain your personal data for as long as your account is active or as needed to provide services. Specifically:

• Active account data is retained for the duration of your membership plus 12 months after account closure.
• Payment records and invoices are retained for 7 years for tax and legal compliance purposes.
• Coach–client message history is retained for 24 months after the coaching relationship ends.
• Progress photos and health documents are deleted upon request or automatically 12 months after account closure.
• Anonymised, aggregated analytics data may be retained indefinitely.

You may request early deletion of your data at any time, subject to our legal retention obligations.`,
  },
  {
    title: '10. Children\'s Privacy',
    content: `AthloCode is intended for users who are 18 years of age or older. We do not knowingly collect personal information from individuals under 18.

If we become aware that we have collected personal data from a minor without appropriate parental consent, we will take steps to delete that information promptly. If you believe a minor has registered on our platform, please contact us at support@athlocode.com.`,
  },
  {
    title: '11. International Data Transfers',
    content: `AthloCode operates primarily within the UAE and GCC region. However, our infrastructure providers (Supabase, Stripe, and others) may process data on servers located in other countries, including the United States and European Union.

Where data is transferred internationally, we ensure that appropriate safeguards are in place — including data processing agreements and compliance with applicable cross-border data transfer regulations.

By using the Platform, you consent to the international transfer of your data as described in this Policy.`,
  },
  {
    title: '12. Third-Party Links',
    content: `The AthloCode platform may contain links to third-party websites or services (such as WhatsApp, social media platforms, or external resources). This Privacy Policy does not apply to those third-party services.

We encourage you to review the privacy policies of any third-party services you visit. AthloCode is not responsible for the privacy practices or content of external sites.`,
  },
  {
    title: '13. Changes to This Privacy Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we make material changes, we will:

• Update the "Last Updated" date at the top of this page.
• Notify you via email or a prominent notice on the platform.
• Where required by law, seek your renewed consent.

We encourage you to review this Policy periodically. Your continued use of the platform following any update constitutes acceptance of the revised Policy.`,
  },
  {
    title: '14. Contact & Data Controller',
    content: `AthloCode is the data controller responsible for your personal information.

If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:

Email: support@athlocode.com
Contact Form: athlocode.com/contact
WhatsApp: Available through the platform for active members

We are committed to resolving all privacy concerns promptly and will respond to enquiries within 30 days.`,
  },
];

export default function PrivacyPage() {
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
        .privacy-highlight {
          background: rgba(201,168,76,0.06);
          border-left: 3px solid rgba(201,168,76,0.4);
          border-radius: 0 8px 8px 0;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.7;
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          Privacy
        </div>
        <h1 className="legal-title">Privacy <span>Policy</span></h1>
        <p className="legal-meta">
          Last updated: {lastUpdated} &nbsp;·&nbsp; Applies to all AthloCode users and platform visitors &nbsp;·&nbsp; Jurisdiction: Dubai, UAE
        </p>

        {/* Commitment callout */}
        <div className="privacy-highlight">
          🔒 <strong style={{ color: '#C9A84C' }}>Our commitment:</strong> We do not sell your personal information. We do not share your health data with advertisers. Your data is used solely to deliver your personalised coaching experience.
        </div>

        {/* Intro */}
        <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: '2.5rem' }}>
          At AthloCode, privacy is not an afterthought — it is a core part of our platform design. We handle your health and personal data with the care it deserves. This Privacy Policy explains exactly what information we collect, why we collect it, and how it is protected.
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
          <p style={{ fontWeight: 700, color: '#C9A84C', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Privacy Questions or Data Requests?</p>
          <p>
            Contact our team at <a href="mailto:support@athlocode.com">support@athlocode.com</a>. For data deletion, access, or correction requests, include "Data Request" in your subject line. We respond within 30 days.
          </p>
        </div>

        {/* Related links */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/terms" style={{ fontSize: '0.82rem', color: '#C9A84C', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
            Terms of Service
          </a>
          <a href="/contact" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
            Contact Us
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
