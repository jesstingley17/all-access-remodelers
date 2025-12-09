import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "692298dd0bb845c13d256fec", 
  requiresAuth: true // Ensure authentication is required for all operations
});
