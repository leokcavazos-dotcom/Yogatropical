import { LEGAL } from "@/lib/legal";

// Bumping this version invalidates previously signed waivers (SafetyAcknowledgment
// is unique per user+version), so anyone who signed an older version will be asked
// to re-sign the next time they try to book or publish a class.
export const WAIVER_VERSION = "2026-10-v2";

export const WAIVER_TEXT = `SAFETY WAIVER, ASSUMPTION OF RISK, AND RELEASE OF LIABILITY

Please read carefully. This affects your legal rights.

1. Voluntary participation. I am taking part in movement, stretching, breathwork, meditation, and related classes on Yoga Tropical (virtual or in person) voluntarily.

2. Risks. I understand these activities carry inherent risks, including muscle strains, sprains, joint injuries, falls, dizziness, fainting, shortness of breath, emotional discomfort, aggravation of existing conditions, and, in rare cases, serious injury. In-person classes carry additional risks from unfamiliar spaces, surfaces, equipment, and travel.

3. My health. I will check with a physician before participating if I am pregnant, have high blood pressure, a heart or lung condition, recent surgery or injury, or any condition that movement, breath-holding, or changes in blood pressure could affect. I will tell my instructor about any injury or condition that could affect my practice.

4. My responsibility. I will move at my own pace, skip anything that doesn't feel right, and stop immediately if I feel pain, dizziness, shortness of breath, or distress. Only I know what my body can safely do. I am not taking part while under the influence of alcohol or drugs.

5. Not treatment. Classes are for general wellness only. They are not medical, mental health, or addiction treatment, and they do not replace my doctor, therapist, counselor, treatment program, or recovery supports. If I am in crisis, I will call or text 988 (in the US) or my local emergency number.

6. Assumption of risk. I knowingly assume all risks of participating, both known and unknown.

7. Release. To the fullest extent permitted by law, I release, waive, and agree not to sue ${LEGAL.companyName}, its members, managers, employees, and contractors, and the instructors who teach on Yoga Tropical, for any injury, illness, loss, or damage arising out of my participation, including claims based on their ordinary negligence. This release does not apply to gross negligence or willful misconduct, or where the law does not allow it.

8. Emergencies. If I need emergency care during a class, I authorize the instructor to call emergency services, and I am responsible for any resulting costs.

9. Minors. If I am signing for a child or teen, I am their parent or legal guardian, I agree to these terms on their behalf, and I will supervise or arrange appropriate supervision for their participation.

10. Recording. I understand that live video classes may be recorded for quality control and safety, as described in the Terms of Service.

By typing my full name and checking the box, I confirm that I have read and understood this waiver, and that I am 18 or older (or signing as a parent or guardian).`;
