import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy — Yoga Tropical" };

const L = LEGAL;

const sections: LegalSection[] = [
  {
    heading: "Who we are",
    blocks: [
      `${L.companyName} ("Yoga Tropical," "we," "us") operates yogatropical.com and is responsible for the personal information described in this policy. Questions or requests: ${L.contactEmail}, or ${L.mailingAddress}.`,
    ],
  },
  {
    heading: "Information we collect",
    blocks: [
      "Information you give us:",
      [
        "Account details: name, email, password (stored only as a secure hash), phone number (optional), and whether you're a client or instructor.",
        "Profile details: photo, languages, bio, and the answers you choose to add to your profile.",
        "Instructor details: specialties, availability, prices, where you teach, and documents you upload for verification, such as certificates, CPR cards, and proof of insurance.",
        "Safety waiver: your typed signature, the waiver version, and the date you signed.",
        "Bookings and messages: the classes you request, book, teach, or cancel, and your communications with us.",
      ],
      "Payment information: payments are handled by Stripe. We don't see or store full card or bank numbers. We store Stripe identifiers and payment status (for example, whether a booking was paid or refunded). Instructors provide identity and bank details directly to Stripe to receive payouts.",
      "Automatically collected information: our hosting provider records standard technical data when you use the Platform, such as your IP address, browser type, and pages requested, to keep the Platform running and secure. We use only essential cookies, such as the cookie that keeps you signed in. We don't use advertising trackers or sell data to advertisers.",
      "Class recordings: live video classes may be recorded for quality control and safety, as described in our Terms.",
    ],
  },
  {
    heading: "Sensitive information",
    blocks: [
      "Some profile questions let you share information that may relate to your health, such as notes for instructors about injuries, pregnancy, or being in recovery. Sharing this is always optional. If you choose to share it, you consent to our storing it and showing it only to instructors you've requested or booked a class with, so they can teach you safely. You can edit or delete it at any time.",
      "We never use sensitive information for advertising, and we never sell it.",
    ],
  },
  {
    heading: "How we use information",
    blocks: [
      [
        "To create and run your account, and to show your profile as described below.",
        "To arrange, charge for, pay out, refund, and record bookings.",
        "To verify instructors' documents and keep the community safe, including reviewing classes and investigating reports.",
        "To communicate with you about your account, bookings, and changes to our policies.",
        "To prevent fraud, abuse, and security incidents, and to comply with legal obligations.",
        "To understand and improve the Platform.",
      ],
      "If you're in the European Economic Area, the UK, or another place that requires a legal basis, we rely on: performing our contract with you; our legitimate interests in running a safe and useful platform; your consent (for optional sensitive information, which you can withdraw at any time); and compliance with legal obligations.",
    ],
  },
  {
    heading: "Who can see your information",
    blocks: [
      [
        "Instructor profiles are public: photo, name, languages, specialties, bio, and the other profile answers. Instructors' verification documents are visible only to signed-in users once we've approved them, and to our team.",
        "Client profiles are private: they're visible only to you, to instructors you've requested or booked a class with, and to our team.",
        "When you book a class, the instructor sees your name and your booking details. For in-person classes, the instructor also sees the address you provide.",
      ],
    ],
  },
  {
    heading: "How we share information",
    blocks: [
      "We don't sell your personal information, and we don't share it for cross-context behavioral advertising. We share it only:",
      [
        "With service providers who operate the Platform for us and may use it only for that purpose: Vercel (hosting, database, and file storage), Stripe (payments and payouts), and Jitsi Meet, operated by 8x8 (live video).",
        "With instructors and clients as described in the section above.",
        "When required by law, or to protect the safety, rights, or property of our users, the public, or Yoga Tropical.",
        "As part of a merger, acquisition, sale of assets, or reorganization (including a conversion to a cooperative), in which case this policy will continue to protect your information.",
      ],
    ],
  },
  {
    heading: "Links, store, and ads",
    blocks: [
      "Store products and sponsored ads link to other companies' websites. Their own privacy policies apply once you leave our site. We may earn a commission when you buy through our store links, and the seller may know you arrived from our site.",
    ],
  },
  {
    heading: "How long we keep information",
    blocks: [
      [
        "Account and profile information: while your account is open. When you close it, we delete or anonymize it within 90 days, except as described below.",
        "Payment, booking, and tax records: as long as required by tax and accounting laws (usually up to 7 years).",
        "Safety waivers and records needed for possible legal claims: until the relevant limitation periods have passed.",
        "Class recordings: for a short retention period (currently 7 days), longer only if needed to address a safety concern, a dispute, or a legal requirement.",
      ],
    ],
  },
  {
    heading: "Security",
    blocks: [
      "We protect information with encryption in transit (HTTPS), hashed passwords, and access controls that limit who can see documents and private profiles. No system is completely secure, so please use a strong, unique password and tell us right away if you suspect unauthorized access.",
    ],
  },
  {
    heading: "Your rights and choices",
    blocks: [
      "Depending on where you live, you may have the right to access, correct, delete, or receive a copy of your personal information; to object to or restrict certain processing; and to withdraw consent. These rights apply under laws such as the California Consumer Privacy Act, the EU and UK GDPR, Brazil's LGPD, and Canada's privacy laws.",
      `To make a request, email ${L.contactEmail}. We'll verify your identity and respond within the time the law requires (usually 30 to 45 days). We won't discriminate against you for exercising your rights. You can also let an authorized agent submit a request for you. If you're in the EU, the UK, or Brazil, you may also complain to your local data protection authority.`,
    ],
  },
  {
    heading: "Children",
    blocks: [
      "The Platform is for adults 18 and older. We don't knowingly collect personal information from children under 13 or let anyone under 18 create an account. A parent or guardian may share information about a minor when booking a class for them, and we use it only to arrange that class. If you believe a child has given us information, contact us and we'll delete it.",
    ],
  },
  {
    heading: "International users",
    blocks: [
      "We're based in the United States, and our service providers may process information in the United States and other countries. Privacy laws there may differ from those where you live. Where required, we use appropriate safeguards for international transfers.",
    ],
  },
  {
    heading: "Changes to this policy",
    blocks: [
      "We may update this policy. If we make material changes, we'll notify you (for example, by email or on the Platform) before they take effect. The \"Last updated\" date at the top shows when it last changed.",
    ],
  },
  {
    heading: "Contact us",
    blocks: [`${L.companyName}, ${L.mailingAddress}. Email: ${L.contactEmail}.`],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={[
        "Your trust matters to us, especially because many people in our community are in recovery. This policy explains what information we collect, how we use it, who can see it, and the choices you have.",
      ]}
      sections={sections}
    />
  );
}
