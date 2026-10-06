import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { LEGAL, CANCELLATION_WINDOW_HOURS } from "@/lib/legal";

export const metadata: Metadata = { title: "Instructor Agreement — Yoga Tropical" };

const L = LEGAL;

const sections: LegalSection[] = [
  {
    heading: "About this agreement",
    blocks: [
      `This Instructor Agreement is between you and ${L.companyName} ("Yoga Tropical," "we," "us"). It applies when you offer or teach classes on the Platform, in addition to our Terms of Service, Privacy Policy, and Code of Conduct. If this agreement conflicts with the Terms on an instructor matter, this agreement controls. Disputes are resolved as described in the Terms, including the arbitration agreement and class action waiver.`,
    ],
  },
  {
    heading: "Independent contractor",
    blocks: [
      "You're an independent contractor, not our employee, agent, or partner. You decide whether, when, where, and how to teach, and you control your own methods. Nothing in this agreement creates an employment relationship, and you're not entitled to employee wages or benefits.",
      "You may teach elsewhere and use other platforms. You're responsible for your own equipment, travel, expenses, licenses, and permits.",
    ],
  },
  {
    heading: "Qualifications and documents",
    blocks: [
      "You confirm that all certificates, CPR cards, insurance documents, and other information you provide are genuine, accurate, and current, and you'll update them if anything changes or expires. Our review of your documents doesn't make us responsible for your qualifications. Providing false or altered documents is grounds for immediate removal and may be reported to authorities.",
    ],
  },
  {
    heading: "Insurance",
    blocks: [
      "Before offering in-person classes, you must hold active professional and general liability insurance that covers your teaching, and upload proof of it. You must keep this coverage in force while you offer in-person classes and tell us promptly if it lapses. We strongly recommend liability insurance for virtual teaching too.",
    ],
  },
  {
    heading: "Teaching safely",
    blocks: [
      [
        "Teach only within your training and experience, and offer modifications for different bodies and abilities.",
        "Ask about injuries and relevant health conditions at the start of class, and encourage students to stop if something doesn't feel right.",
        "Never give medical, psychological, or addiction-treatment advice, and never pressure anyone about their recovery or beliefs.",
        "Never teach while intoxicated or impaired.",
        "Keep physical contact to a minimum. Ask for clear consent before any hands-on adjustment, and respect a \"no\" without question.",
        "For in-person classes, check the space for hazards before starting, and know how to reach emergency services at the location.",
        "Report any injury, incident, or safety concern to us within 24 hours.",
      ],
    ],
  },
  {
    heading: "Conduct and our community",
    blocks: [
      "You'll follow the Code of Conduct, including the dress guidelines and describing practices as \"inspired by\" a tradition. You won't harass, discriminate against, or make romantic or sexual advances toward students. You won't solicit students you met through the Platform to book or pay you outside the Platform in order to avoid fees.",
    ],
  },
  {
    heading: "Prices, fees, and payouts",
    blocks: [
      "You set your own prices, at or above the minimum prices shown on the Platform. Clients pay through the Platform. We keep our service fee (commission) at the rate shown on the Platform and pay you the rest through Stripe Connect. To receive payouts, you must create a Stripe account and agree to Stripe's Connected Account Agreement.",
      "We may hold, adjust, or reverse payouts for refunds, chargebacks, suspected fraud, or violations of this agreement. If we change our fee, we'll give you at least 30 days' notice before it applies to new bookings.",
    ],
  },
  {
    heading: "Cancellations",
    blocks: [
      `If a client cancels at least ${CANCELLATION_WINDOW_HOURS} hours before class, they're refunded in full and you aren't paid for that booking. If they cancel later or don't show up, you keep your payout. If you cancel or don't show up, the client is refunded in full and you aren't paid. Repeated cancellations or no-shows may lead to suspension.`,
    ],
  },
  {
    heading: "Taxes",
    blocks: [
      "You're responsible for reporting and paying all taxes on your earnings. Stripe or we may request tax information and issue tax forms (such as a 1099-K in the US) where the law requires.",
    ],
  },
  {
    heading: "Your content and recordings",
    blocks: [
      "You grant us the license described in the Terms to display your profile, photo, and approved documents, and to use your name and photo to promote your classes and the Platform. You consent to classes being recorded for quality control and safety as described in the Terms.",
    ],
  },
  {
    heading: "Indemnification",
    blocks: [
      `You agree to defend, indemnify, and hold harmless ${L.companyName} and its members, managers, employees, and contractors from any claims, losses, damages, and expenses (including reasonable attorneys' fees) arising out of your classes or teaching, your conduct, any injury to a student or other person connected with your classes, your taxes, your documents, or your breach of this agreement.`,
    ],
  },
  {
    heading: "Ending this agreement",
    blocks: [
      "You can stop teaching and close your account at any time, after honoring or cancelling your confirmed bookings. We may suspend or remove you at any time, including for safety concerns, complaints, expired documents or insurance, or breaking this agreement. Sections about payouts owed, taxes, indemnification, and dispute resolution survive.",
    ],
  },
  {
    heading: "Contact us",
    blocks: [`${L.companyName}, ${L.mailingAddress}. Email: ${L.contactEmail}.`],
  },
];

export default function InstructorAgreementPage() {
  return (
    <LegalPage
      title="Instructor Agreement"
      intro={[
        "Thank you for teaching with us. This agreement explains your role as an independent instructor on Yoga Tropical, what we expect for everyone's safety, and how fees and payouts work.",
      ]}
      sections={sections}
    />
  );
}
