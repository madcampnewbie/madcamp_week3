import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../styles/Error.module.css';

export default function ErrorPage() {
  const router = useRouter();
  const { error } = router.query;

  let errorMessage = 'An unknown error occurred.';
  if (error === 'OAuthAccountNotLinked') {
    errorMessage = 'This email is already registered with another login method.';
  } else if (error === 'Email already in use') {
    errorMessage = 'This email is already in use.';
  }

  return (
    <div className={styles.errorContainer}>
      <h1>Error</h1>
      <p>{errorMessage}</p>
      <Link href="/auth/signin">
        <a>Go to Sign In</a>
      </Link>
    </div>
  );
}
