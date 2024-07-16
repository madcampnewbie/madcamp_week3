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
    async jwt({ token, account, profile, user }) {
      const client = await clientPromise;
      const db = client.db();

      if (account) {
        const existingUser = await db.collection('users').findOne({ email: profile.email });
        const userId = existingUser ? existingUser._id : null;

        return {
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + account.expires_in * 1000,
          refreshToken: account.refresh_token,
          user: {
            ...profile,
            id: userId, // 사용자 ID 추가
          },
        };
      }

      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      session.error = token.error;

      return session;
    },
    async signIn({ user, account, profile }) {
      const client = await clientPromise;
      const db = client.db();

      const existingUser = await db.collection('users').findOne({ email: user.email });
      if (!existingUser) {
        const result = await db.collection('users').insertOne({
          email: user.email,
          name: user.name,
          image: user.image,
          createdAt: new Date(),
          genres: [] // 사용자 장르를 저장할 필드 추가
        });
        user.id = result.insertedId; // 새로 생성된 사용자의 ID를 설정
      } else {
        user.id = existingUser._id; // 기존 사용자의 ID를 설정
        await db.collection('users').updateOne(
          { email: user.email },
          { $set: { lastLogin: new Date() } }
        );
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url === '/api/auth/callback/spotify') {
        return '/genres'; // 장르 선택 페이지로 리디렉션
      }
      return baseUrl;
    },
  },
  session: {
    jwt: true,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
});
