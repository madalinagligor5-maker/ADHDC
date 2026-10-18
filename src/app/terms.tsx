import { LegalScreen } from '@/components/LegalScreen';
import { useStrings } from '@/i18n';

export default function Terms() {
  const { legal } = useStrings();
  return <LegalScreen title={legal.termsTitle} paragraphs={legal.terms} draftNote={legal.draftNote} />;
}
