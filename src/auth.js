// src/auth.js
import { UserManager } from 'oidc-client-ts';

const cognitoAuthConfig = {
  // Uses Cognito's OpenID Provider (issuer) format with your Pool ID and region:
  authority: `https://cognito-idp.us-east-1.amazonaws.com/${process.env.AWS_COGNITO_POOL_ID}`,
  client_id: process.env.AWS_COGNITO_CLIENT_ID,
  redirect_uri: process.env.OAUTH_SIGN_IN_REDIRECT_URL,
  response_type: 'code',
  scope: 'email openid phone',
  // Disable token revoke for access_token and silent renew per oidc-client-ts caveats:
  revokeTokenTypes: ['refresh_token'],
  automaticSilentRenew: false
};

const userManager = new UserManager({ ...cognitoAuthConfig });

export { userManager };

export async function signIn() {
  // Redirects to Cognito Hosted UI
  await userManager.signinRedirect();
}

export async function signOut() {
    try {
      await userManager.removeUser();
    } catch (error) {
      console.error('Error clearing local session:', error);
    }
  
    // For Cognito, construct the Hosted UI logout URL using env-configured domain
    const hosted = process.env.AWS_COGNITO_DOMAIN; // full https://...amazoncognito.com
    if (!hosted) {
      console.error('Missing AWS_COGNITO_DOMAIN for logout');
      return;
    }
  
    const clientId  = process.env.AWS_COGNITO_CLIENT_ID;
    const logoutUri = process.env.OAUTH_SIGN_IN_REDIRECT_URL; // must be in Allowed sign-out URLs
    const url = `${hosted.replace(/\/+$/, '')}/logout?client_id=${encodeURIComponent(clientId)}&logout_uri=${encodeURIComponent(logoutUri)}`;
    window.location.assign(url);
}
  

function formatUser(user) {
  // Minimal profile—add more if you add scopes
  return {
    username: user.profile['cognito:username'],
    email: user.profile.email,
    idToken: user.id_token,
    accessToken: user.access_token,
    authorizationHeaders: (type = 'application/json') => ({
      'Content-Type': type,
      Authorization: `Bearer ${user.id_token}`
    })
  };
}

export async function getUser() {
  // Handle redirect callback (?code=...)
  if (window.location.search.includes('code=')) {
    const user = await userManager.signinCallback();
    // Clean the URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return formatUser(user);
  }

  // Or get the current user from storage
  const user = await userManager.getUser();
  return user ? formatUser(user) : null;
}
