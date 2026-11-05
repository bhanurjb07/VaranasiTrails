import { LegalDocument } from '@/components/common/LegalDocument'
import { termsOfService } from '@/data/legal'

export const TermsPage = () => <LegalDocument title="Terms of service" path="/terms" sections={termsOfService} />
