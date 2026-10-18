import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, LoadingState, Notice, Screen, ScreenHeader } from '@/components';
import { annualSavingsPercent, monthlyEquivalent, PLANNED_FEATURES, PLUS_FEATURES } from '@/domain/plans';
import { format, formatPrice, useLanguage, useStrings } from '@/i18n';
import { subscriptionService, type Offering, type ProductId } from '@/services/subscription';
import { colors, radius, spacing } from '@/theme';

/**
 * Plus offer. Without configured store products this is an "offer preview":
 * prices are the planned ones, the purchase button is disabled, nothing is charged.
 */
export default function Paywall() {
  const strings = useStrings();
  const language = useLanguage();
  const s = strings.paywall;
  const [offerings, setOfferings] = useState<Offering[] | null>(null);
  const [selected, setSelected] = useState<ProductId>('plus_annual');
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const preview = !subscriptionService.isConfigured;

  useEffect(() => {
    subscriptionService
      .getOfferings()
      .then(setOfferings)
      .catch(() => setOfferings([]));
  }, []);

  const restore = async () => {
    setRestoring(true);
    try {
      const entitlement = await subscriptionService.restore();
      setRestoreMessage(entitlement.plus ? null : s.restoreNone);
    } finally {
      setRestoring(false);
    }
  };

  if (offerings === null) return <LoadingState />;

  const annual = offerings.find((offer) => offer.productId === 'plus_annual');
  const monthly = offerings.find((offer) => offer.productId === 'plus_monthly');
  const price = (amount: number, currency: Offering['currency']) => formatPrice(amount, currency, language);

  return (
    <Screen
      footer={
        <>
          <Button
            label={preview ? s.ctaUnavailable : s.cta}
            disabled={preview}
            onPress={() => subscriptionService.purchase(selected)}
          />
          <Button variant="ghost" label={s.continueFree} onPress={() => router.back()} />
        </>
      }
    >
      <ScreenHeader title="" modal />
      {preview ? (
        <View style={styles.previewTag}>
          <AppText variant="overline" color={colors.action}>
            {s.preview.toUpperCase()}
          </AppText>
        </View>
      ) : null}
      <AppText variant="title" accessibilityRole="header">
        {s.title}
      </AppText>
      <AppText variant="body" color={colors.textMuted}>
        {s.subtitle}
      </AppText>

      <View style={styles.list}>
        {PLUS_FEATURES.map((feature) => (
          <View key={feature} style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color={colors.progress} />
            <AppText variant="body" style={styles.flex}>
              {s.benefits[feature]}
            </AppText>
          </View>
        ))}
      </View>

      {annual ? (
        <PlanCard
          selected={selected === 'plus_annual'}
          onPress={() => setSelected('plus_annual')}
          label={s.annual}
          badge={
            monthly
              ? format(s.savings, {
                  n: annualSavingsPercent({ currency: annual.currency, annual: annual.price, monthly: monthly.price }),
                })
              : undefined
          }
          price={format(s.perYear, { price: price(annual.price, annual.currency) })}
          detail={format(s.annualEquivalent, { price: price(monthlyEquivalent({ currency: annual.currency, annual: annual.price, monthly: monthly?.price ?? 0 }), annual.currency) })}
          intro={
            annual.introPrice !== undefined
              ? format(s.introOffer, { price: price(annual.introPrice, annual.currency), regular: price(annual.price, annual.currency) })
              : undefined
          }
        />
      ) : null}
      {monthly ? (
        <PlanCard
          selected={selected === 'plus_monthly'}
          onPress={() => setSelected('plus_monthly')}
          label={s.monthly}
          price={format(s.perMonth, { price: price(monthly.price, monthly.currency) })}
        />
      ) : null}

      <AppText variant="caption" color={colors.textMuted}>
        {s.renewal}
      </AppText>
      {preview ? <Notice>{s.previewNote}</Notice> : null}
      <AppText variant="caption" color={colors.textMuted}>
        {s.freeIncludes}
      </AppText>

      <Card>
        <AppText variant="label" color={colors.textMuted}>
          {s.plannedTitle}
        </AppText>
        {PLANNED_FEATURES.map((feature) => (
          <View key={feature} style={styles.benefit}>
            <Ionicons name="time-outline" size={18} color={colors.textFaint} />
            <AppText variant="caption" color={colors.textMuted} style={styles.flex}>
              {s.planned[feature]}
            </AppText>
          </View>
        ))}
      </Card>

      <Button variant="ghost" label={s.restore} onPress={restore} loading={restoring} />
      {restoreMessage ? <Notice>{restoreMessage}</Notice> : null}
      <View style={styles.links}>
        <Pressable accessibilityRole="link" onPress={() => router.push('/terms')} style={styles.link}>
          <AppText variant="caption" color={colors.textMuted}>
            {s.terms}
          </AppText>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={() => router.push('/privacy')} style={styles.link}>
          <AppText variant="caption" color={colors.textMuted}>
            {s.privacy}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

interface PlanCardProps {
  selected: boolean;
  onPress: () => void;
  label: string;
  price: string;
  detail?: string;
  badge?: string;
  intro?: string;
}

function PlanCard({ selected, onPress, label, price, detail, badge, intro }: PlanCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.plan, selected && styles.planSelected]}
    >
      <View style={styles.planHeader}>
        <AppText variant="overline" color={selected ? colors.action : colors.textMuted}>
          {label}
        </AppText>
        {badge ? (
          <View style={styles.badge}>
            <AppText variant="caption" color={colors.action}>
              {badge}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="heading">{price}</AppText>
      {detail ? (
        <AppText variant="caption" color={colors.textMuted}>
          {detail}
        </AppText>
      ) : null}
      {intro ? (
        <AppText variant="caption" color={colors.textMuted}>
          {intro}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  previewTag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.action,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  list: { gap: spacing.sm },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  plan: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
  planSelected: { borderColor: colors.action, borderWidth: 2 },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  badge: { borderRadius: radius.pill, backgroundColor: colors.actionSoft, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  links: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg },
  link: { minHeight: 44, justifyContent: 'center' },
});
