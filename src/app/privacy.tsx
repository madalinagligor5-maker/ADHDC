import { LegalScreen } from '@/components/LegalScreen';
import { useStrings } from '@/i18n';

export default function Privacy() {
  const { legal } = useStrings();
  return <LegalScreen title={legal.privacyTitle} paragraphs={legal.privacy} draftNote={legal.draftNote} />;
}
