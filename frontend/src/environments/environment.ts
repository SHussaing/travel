export const environment = {
  production: false,
  apiUrl: 'https://localhost:9080',
  // IMPORTANT: This must be your Stripe PUBLISHABLE key (pk_test_...), NOT secret key (sk_test_...)
  // Get your publishable key from: https://dashboard.stripe.com/test/apikeys
  stripePublicKey: 'pk_test_51TUrn13pcwa5FhNoIsfo895z5dEIJrAmul6WTWZYif7HVsTcslp0crkA55ZwKOCr3vmWrX43T1x2nV3IQkBv9Zic002fueKf0d', // Replace with your Stripe PUBLISHABLE key
  googleMapsApiKey: 'AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Replace with your Google Maps API key
  // Get your PayPal client ID from: https://developer.paypal.com/dashboard/applications/sandbox
  paypalClientId: 'AZwSOSaMgMM90lzjWIWOxU_g73gt8R7Nkl1YBArOMroWuDQpb9B8nyOcUpNt18D1P0jfmGpRrZSaSlvH', // Replace with your PayPal Sandbox Client ID
  endpoints: {
    auth: {
      login: '/api/v1/auth/login',
      register: '/api/v1/auth/register',
      logout: '/api/v1/auth/logout',
      refresh: '/api/v1/auth/refresh'
    },
    users: {
      base: '/api/v1/users',
      profile: '/api/v1/users/profile',
      update: '/api/v1/users/profile'
    },
    travels: {
      base: '/api/v1/travels',
      search: '/api/v1/travels/search/advanced',
      byId: (id: string) => `/api/v1/travels/${id}`,
      byManager: '/api/v1/travels/my-travels',
      managerStats: '/api/v1/travels/manager/stats'
    },
    subscriptions: {
      base: '/api/v1/subscriptions',
      byUser: '/api/v1/subscriptions/my-subscriptions',
      byTravel: (travelId: string) => `/api/v1/subscriptions/travel/${travelId}`
    },
    payments: {
      base: '/api/v1/payments',
      process: '/api/v1/payments/process',
      bySubscription: (subscriptionId: string) => `/api/v1/payments/subscription/${subscriptionId}`
    },
    feedbacks: {
      base: '/api/v1/feedbacks',
      byTravel: (travelId: string) => `/api/v1/feedbacks/travel/${travelId}`,
      myFeedbacks: '/api/v1/feedbacks/my-feedbacks'
    },
    reports: {
      base: '/api/v1/reports',
      dashboard: '/api/v1/reports/dashboard'
    },
    dashboard: {
      admin: '/api/v1/dashboard/admin',
      manager: '/api/v1/dashboard/manager',
      traveler: '/api/v1/dashboard/traveler'
    },
    admin: {
      base: '/api/v1/admin'
    }
  },
  features: {
    enableElasticsearch: true,
    enableNeo4jRecommendations: true,
    enableAnalytics: true
  }
};
