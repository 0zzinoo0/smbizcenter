import { json } from './_auth.js';

export default async (request) => {
  if (request.method !== 'GET') return json(405, { error: 'GET만 허용됩니다.' });
  return json(200, {
    ga4MeasurementId: process.env.GA4_MEASUREMENT_ID || '',
    googleAdsId: process.env.GOOGLE_ADS_ID || '',
    googleAdsConversionLabel: process.env.GOOGLE_ADS_CONVERSION_LABEL || '',
    googleAdsConversionValue: Number(process.env.GOOGLE_ADS_CONVERSION_VALUE || 1),
    googleAdsCurrency: process.env.GOOGLE_ADS_CURRENCY || 'KRW'
  });
};
