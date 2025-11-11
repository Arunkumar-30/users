
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Welcome to Auth App</h1>
      <p>
        <Link href="/signup">Signup</Link> | <Link href="/signin">Signin</Link>
      </p>
    </div>
  );
}
