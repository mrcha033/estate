import { Analytics } from '@segment/analytics-node';

const SEGMENT_WRITE_KEY = process.env.SEGMENT_WRITE_KEY || '';

let analytics: Analytics | null = null;

export const getAnalytics = () => {
  if (!analytics) {
    analytics = new Analytics({
      writeKey: SEGMENT_WRITE_KEY,
    });
  }
  return analytics;
};
