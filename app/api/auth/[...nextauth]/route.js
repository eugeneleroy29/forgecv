import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '@/lib/supabase'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })
        if (error || !data.user) return null
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          first_name: user.name?.split(' ')[0],
          last_name: user.name?.split(' ').slice(1).join(' '),
          avatar_url: user.image,
        }, { onConflict: 'id' })
        if (error) return false
      }
      return true
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }