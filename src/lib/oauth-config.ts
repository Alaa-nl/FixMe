/**
 * OAuth Configuration Status
 * This file exports the OAuth configuration status for use in the UI
 */

// Check if Google OAuth is properly configured
export const isGoogleOAuthEnabled = () => {
  if (typeof window === 'undefined') {
    // Server-side check
    return (
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_ID !== "your-google-client-id" &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CLIENT_SECRET !== "your-google-client-secret"
    );
  }
  // Client-side always returns false unless we expose it through an API
  // For security, we don't expose OAuth credentials to the client
  return false; // Will be updated by checking providers endpoint
};

// Apple OAuth is disabled for pre-launch
export const isAppleOAuthEnabled = () => false;