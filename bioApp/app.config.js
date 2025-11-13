export default ({ config }) => ({
  ...config,
  name: config.name || 'bioApp',
  slug: config.slug || 'bioApp',
  extra: {
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PK || 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX',
  },
});