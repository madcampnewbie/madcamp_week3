import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import clientPromise from '../../../libs/mongodb';

async function refreshAccessToken(token) {
  try {
    const url = "https://accounts.spotify.com/api/token";
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: "https://accounts.spotify.com/authorize?scope=user-read-email,user-read-private,streaming,user-modify-playback-state"
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        console.log('New account. Setting up tokens:', account);
        return {
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + account.expires_in * 1000,
          refreshToken: account.refresh_token,
          user: profile,
        };
      }

      if (Date.now() < token.accessTokenExpires) {
        console.log('Token still valid:', token);
        return token;
      }

      console.log('Token expired. Refreshing...');
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      session.error = token.error;
      console.log('Session updated:', session);
      return session;
    },
    async signIn({ user, account, profile }) {
      const client = await clientPromise;
      const db = client.db();

      const existingUser = await db.collection('users').findOne({ email: user.email });
      if (!existingUser) {
        await db.collection('users').insertOne({
          email: user.email,
          name: user.name,
          image: user.image,
          createdAt: new Date(),
        });
      } else {
        await db.collection('users').updateOne(
          { email: user.email },
          { $set: { lastLogin: new Date() } }
        );
      }

      return true;
    }
  },
  session: {
    jwt: true,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
});
