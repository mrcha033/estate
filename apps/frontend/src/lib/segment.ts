import { AnalyticsBrowser } from '@segment/analytics-next';

const SEGMENT_WRITE_KEY = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || '';

let analytics: AnalyticsBrowser | null = null;

export const getAnalytics = () => {
  if (typeof window !== 'undefined' && !analytics && SEGMENT_WRITE_KEY) {
    analytics = AnalyticsBrowser.load({
      writeKey: SEGMENT_WRITE_KEY,
    });
  }
  return analytics;
};
