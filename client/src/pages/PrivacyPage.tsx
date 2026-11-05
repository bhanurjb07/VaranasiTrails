import { LegalDocument } from '@/components/common/LegalDocument'
import { privacyPolicy } from '@/data/legal'

export const PrivacyPage = () => <LegalDocument title="Privacy policy" path="/privacy" sections={privacyPolicy} />
