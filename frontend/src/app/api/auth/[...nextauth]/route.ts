import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import api from '@/lib/api';

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Call backend login endpoint
          const response = await api.post('/api/auth/login', {
            email: credentials.email,
            password: credentials.password,
          });

          if (response.data.success && response.data.data) {
            const user = response.data.data;
            return {
              id: user.id,
              email: user.email,
              name: `${user.first_name} ${user.last_name}`,
              image: user.profile_image_url,
            };
          }

          return null;
        } catch (error: any) {
          const message = error.response?.data?.error || 'Login failed';
          throw new Error(message);
        }
      },
    }),
  ],

  pages: {
    signIn: '/auth/login',
    signUp: '/auth/signup',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET || '',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User ${user?.email} signed in`);
    },

    async signOut({ token }) {
      console.log('User signed out');
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions };
