import { AppText, Notice, Screen, ScreenHeader } from '@/components';
import { colors } from '@/theme';

/** Draft legal text, clearly marked as not legally reviewed. */
export function LegalScreen({ title, paragraphs, draftNote }: { title: string; paragraphs: string[]; draftNote: string }) {
  return (
    <Screen>
      <ScreenHeader title={title} />
      <Notice tone="warning">{draftNote}</Notice>
      {paragraphs.map((paragraph) => (
        <AppText key={paragraph} variant="body" color={colors.text}>
          {paragraph}
        </AppText>
      ))}
    </Screen>
  );
}
