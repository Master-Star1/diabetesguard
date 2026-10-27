import type { Subscription } from '../types';
import { PREMIUM_ENABLED } from '../config';

export function usePlanFeatures(subscription: Subscription) {
  const isPremium = !PREMIUM_ENABLED || subscription.tier === 'premium';
  return {
    isPremium,
    maxEntries: isPremium ? Infinity : 10,
    canViewChart: isPremium,
    canExportPDF: isPremium,
    canViewMealPlan: isPremium,
    canViewHbA1c: isPremium,
    maxTipsVisible: isPremium ? Infinity : 5,
  };
}
