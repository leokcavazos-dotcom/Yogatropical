import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { LEGAL, CANCELLATION_WINDOW_HOURS } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms of Service — Yoga Tropical" };

const L = LEGAL;

const sections: LegalSection[] = [
  {
    heading: "Who we are and what these Terms cover",
    blocks: [
      `Yoga Tropical is operated by ${L.companyName}, a limited liability company organized in ${L.stateOfFormation} ("Yoga Tropical," "we," "us"). These Terms of Service ("Terms") govern your use of yogatropical.com and any related services (the "Platform").`,
      "By creating an account, booking or teaching a class, or otherwise using the Platform, you agree to these Terms, our Privacy Policy, and our Code of Conduct. Instructors also agree to the Instructor Agreement. If you don't agree, please don't use the Platform.",
      "IMPORTANT: SECTION 17 CONTAINS AN ARBITRATION AGREEMENT AND CLASS ACTION WAIVER THAT AFFECT HOW DISPUTES ARE RESOLVED. PLEASE READ IT.",
    ],
  },
  {
    heading: "Eligibility and accounts",
    blocks: [
      "You must be at least 18 years old and able to form a binding contract to create an account. Children and teens may take part in classes only when a parent or legal guardian books the class, agrees to these Terms, and signs the safety waiver on their behalf. The parent or guardian is responsible for the minor's participation.",
      "You agree to give accurate information, keep your password confidential, and tell us promptly about any unauthorized use of your account. You're responsible for activity under your account.",
    ],
  },
  {
    heading: "Yoga Tropical is a marketplace",
    blocks: [
      "Yoga Tropical is a platform that connects clients with independent instructors. Instructors are independent contractors, not our employees, agents, or partners. Instructors decide how to teach their classes, and they are solely responsible for their instruction, conduct, and compliance with applicable laws.",
      "We review documents that instructors submit (such as certificates, CPR cards, and proof of insurance), but we don't guarantee the authenticity of any document, the accuracy of any profile, or the quality, safety, or suitability of any class or instructor. Please use your own judgment when choosing a class or instructor.",
      "Classes are described as \"inspired by\" traditions such as yoga, tai chi, or qigong. They are secular movement, breath, and mindfulness practices, not religious instruction.",
    ],
  },
  {
    heading: "Not medical care, therapy, or addiction treatment",
    blocks: [
      "THE PLATFORM AND ALL CLASSES ARE FOR GENERAL WELLNESS PURPOSES ONLY. NOTHING ON THE PLATFORM IS MEDICAL, PSYCHOLOGICAL, OR PSYCHIATRIC ADVICE, DIAGNOSIS, OR TREATMENT, AND NOTHING ON THE PLATFORM IS AN ADDICTION TREATMENT, DETOX, OR RECOVERY PROGRAM.",
      "Classes are not a substitute for care from a doctor, therapist, counselor, treatment program, or peer-support group. Keep working with your care team and recovery supports, and check with a doctor before starting any new physical activity.",
      "If you're in crisis or thinking about harming yourself, call or text 988 (Suicide & Crisis Lifeline, in the US) or your local emergency number. For substance use support in the US, call the SAMHSA National Helpline at 1-800-662-4357 (free, confidential, 24/7). In an emergency, call 911 or your local emergency number.",
    ],
  },
  {
    heading: "Assumption of risk and release",
    blocks: [
      "Movement, stretching, breathwork, and meditation involve inherent risks, including muscle strains, sprains, falls, dizziness, fainting, aggravation of existing conditions, and, in rare cases, serious injury. In-person classes add further risks, such as unfamiliar spaces, surfaces, equipment, and travel.",
      "You take part voluntarily and at your own risk. You're responsible for deciding whether an activity is right for you, moving within your limits, and stopping if something doesn't feel right.",
      `TO THE FULLEST EXTENT PERMITTED BY LAW, YOU RELEASE ${L.companyName.toUpperCase()} AND ITS MEMBERS, MANAGERS, EMPLOYEES, AND CONTRACTORS FROM ANY CLAIMS ARISING OUT OF OR RELATED TO YOUR PARTICIPATION IN ANY CLASS OR YOUR USE OF THE PLATFORM, INCLUDING CLAIMS BASED ON NEGLIGENCE, EXCEPT WHERE SUCH A RELEASE IS NOT ALLOWED BY LAW (FOR EXAMPLE, FOR GROSS NEGLIGENCE OR WILLFUL MISCONDUCT). You'll also sign a safety waiver before your first class, and it is part of these Terms.`,
    ],
  },
  {
    heading: "Bookings, prices, and payments",
    blocks: [
      "Instructors set their own prices, subject to the minimum prices shown on the Platform. Prices are in US dollars unless stated otherwise. A booking request becomes a confirmed booking only when the instructor accepts it.",
      "Your card is charged when the instructor accepts your booking. Payments are processed by Stripe, Inc., and by paying you also agree to Stripe's terms. We never see or store your full card number.",
      "We keep a service fee (commission) from each booking and pay the remainder to the instructor through Stripe. Instructors are responsible for their own taxes. You're responsible for any taxes that apply to your purchases, other than taxes on our own income.",
    ],
  },
  {
    heading: "Cancellations and refunds",
    blocks: [
      [
        `If you cancel an accepted booking at least ${CANCELLATION_WINDOW_HOURS} hours before the class starts, you'll get a full refund.`,
        `If you cancel less than ${CANCELLATION_WINDOW_HOURS} hours before the class starts, or don't show up, you won't get a refund. The instructor reserved that time for you.`,
        "If the instructor cancels or doesn't show up, you'll get a full refund.",
        "If a class can't happen because of a technical problem on our side, contact us and we'll make it right with a refund or credit.",
      ],
      "Refunds go back to your original payment method and can take 5–10 business days to appear, depending on your bank. If you believe a charge is wrong, please contact us before disputing it with your bank so we can fix it quickly.",
    ],
  },
  {
    heading: "Class recordings",
    blocks: [
      "Live video classes may be recorded for quality control, safety, and to resolve disputes. By joining a video class, you consent to being recorded. Recordings are reviewed only by our team or people acting for us, are never shared publicly or sold, and are deleted after our retention period unless we need to keep them longer to address a safety concern, a dispute, or a legal requirement.",
      "You may not record, screenshot, or share any class or any participant without the consent of everyone in it.",
    ],
  },
  {
    heading: "Your content",
    blocks: [
      "You keep ownership of what you post, such as your profile photo, bio, and documents (\"Your Content\"). You give us a worldwide, non-exclusive, royalty-free license to host, store, display, and reproduce Your Content only to operate, promote, and improve the Platform, for as long as it's on the Platform (and for a reasonable time afterward in backups).",
      "You confirm that you have the rights to Your Content, that it's accurate, and that it doesn't infringe anyone's rights or break any law. Documents you upload, such as certificates and insurance, must be genuine and current.",
    ],
  },
  {
    heading: "Rules of conduct",
    blocks: [
      "You agree to follow our Code of Conduct and not to:",
      [
        "Harass, threaten, discriminate against, or sexually exploit anyone, or share sexual content.",
        "Attend or teach a class while intoxicated or impaired.",
        "Share false information, impersonate anyone, or upload fake or altered documents.",
        "Arrange to pay or be paid outside the Platform for classes found through the Platform, in order to avoid our fees.",
        "Collect other users' personal information, send spam, or use the Platform for any unlawful purpose.",
        "Interfere with the Platform's security or operation, or access it with bots or scrapers.",
      ],
      "We may remove content, cancel bookings, or suspend or close accounts that break these rules, at our discretion.",
    ],
  },
  {
    heading: "Store, affiliate links, and ads",
    blocks: [
      "Our store features products sold by other companies. When you click a product, you leave the Platform and buy directly from that seller, under its own terms, shipping, and return policies. We don't sell, ship, or guarantee these products. We may earn a commission from qualifying purchases, at no extra cost to you.",
      "The Platform may show sponsored ads, which are labeled \"Sponsored.\" We aren't responsible for third-party websites, products, or services reached through links or ads.",
    ],
  },
  {
    heading: "Copyright complaints",
    blocks: [
      `If you believe content on the Platform infringes your copyright, send a notice to our designated agent at ${L.contactEmail} or ${L.mailingAddress}. Include: your contact information; a description of the work; the location of the infringing material; a statement that you believe in good faith the use isn't authorized; a statement, under penalty of perjury, that your notice is accurate and that you're the owner or authorized to act for the owner; and your physical or electronic signature. We'll remove infringing content and close the accounts of repeat infringers where appropriate.`,
    ],
  },
  {
    heading: "Disclaimers",
    blocks: [
      "THE PLATFORM, ALL CLASSES, AND ALL CONTENT ARE PROVIDED \"AS IS\" AND \"AS AVAILABLE,\" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DON'T WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT ANY INSTRUCTOR, CLASS, OR RESULT WILL MEET YOUR EXPECTATIONS.",
    ],
  },
  {
    heading: "Limitation of liability",
    blocks: [
      `TO THE FULLEST EXTENT PERMITTED BY LAW, ${L.companyName.toUpperCase()} AND ITS MEMBERS, MANAGERS, EMPLOYEES, AND CONTRACTORS WON'T BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO THE PLATFORM, ANY CLASS, OR THESE TERMS.`,
      "OUR TOTAL LIABILITY FOR ALL CLAIMS RELATED TO THE PLATFORM OR THESE TERMS WON'T EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN SERVICE FEES IN THE 12 MONTHS BEFORE THE CLAIM AROSE, OR (B) US $100. SOME PLACES DON'T ALLOW THESE LIMITS, SO THEY MAY NOT ALL APPLY TO YOU.",
    ],
  },
  {
    heading: "Indemnification",
    blocks: [
      `You agree to defend, indemnify, and hold harmless ${L.companyName} and its members, managers, employees, and contractors from any claims, losses, damages, and expenses (including reasonable attorneys' fees) arising out of your use of the Platform, your participation in or teaching of any class, Your Content, or your violation of these Terms or of anyone's rights.`,
    ],
  },
  {
    heading: "Suspension and termination",
    blocks: [
      "You can close your account at any time by contacting us. We may suspend or close your account, or stop offering the Platform, at any time, including if we believe you've broken these Terms or created risk for others. Sections that by their nature should survive termination (such as releases, disclaimers, limits of liability, indemnification, and dispute resolution) will survive.",
    ],
  },
  {
    heading: "Dispute resolution, arbitration, and class action waiver",
    blocks: [
      `Informal resolution first. Before filing any claim, you agree to contact us at ${L.contactEmail} and try to resolve the dispute informally for at least 30 days.`,
      "Binding arbitration. Except as described below, any dispute arising out of or relating to these Terms, the Platform, or any class will be resolved by binding individual arbitration administered by the American Arbitration Association under its Consumer Arbitration Rules, rather than in court. The arbitrator may award the same individual relief a court could. Judgment on the award may be entered in any court with jurisdiction.",
      "Exceptions. Either party may bring an individual claim in small claims court if it qualifies, and either party may seek a court order to stop infringement or misuse of intellectual property.",
      "CLASS ACTION WAIVER. YOU AND YOGA TROPICAL MAY BRING CLAIMS AGAINST EACH OTHER ONLY IN AN INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS, COLLECTIVE, OR REPRESENTATIVE PROCEEDING. YOU AND WE BOTH WAIVE THE RIGHT TO A JURY TRIAL.",
      `30-day opt-out. You can opt out of this arbitration agreement by emailing ${L.contactEmail} within 30 days of first accepting these Terms, with your name, your account email, and a clear statement that you're opting out of arbitration.`,
      "If the class action waiver is found unenforceable for a particular claim, that claim must be decided in court and not in arbitration.",
    ],
  },
  {
    heading: "Governing law",
    blocks: [
      `These Terms are governed by the laws of the State of ${L.stateOfFormation} and applicable US federal law, including the Federal Arbitration Act, without regard to conflict-of-law rules. For any matter not subject to arbitration, you agree to the exclusive jurisdiction of the state and federal courts located in ${L.stateOfFormation}.`,
    ],
  },
  {
    heading: "Changes and general terms",
    blocks: [
      "We may update these Terms. If we make material changes, we'll notify you (for example, by email or on the Platform) before they take effect, and your continued use after that means you accept them.",
      "These Terms, the Privacy Policy, the Code of Conduct, the safety waiver, and (for instructors) the Instructor Agreement are the entire agreement between you and us about the Platform. If any part is found unenforceable, the rest stays in effect. Our not enforcing a provision isn't a waiver. You can't transfer these Terms without our consent; we may transfer them as part of a merger, sale, or reorganization, including a conversion to a cooperative.",
    ],
  },
  {
    heading: "Contact us",
    blocks: [`${L.companyName}, ${L.mailingAddress}. Email: ${L.contactEmail}.`],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={[
        "Please read these Terms carefully. They explain your rights and responsibilities when you use Yoga Tropical, including important limits on our liability and how disputes are resolved.",
      ]}
      sections={sections}
    />
  );
}
