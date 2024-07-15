import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Navbar />
      <script src="https://sdk.scdn.co/spotify-player.js"></script>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;