import Link from "next/link";

export function SetupNotice() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="card max-w-lg p-8">
        <p className="eyebrow">Setup needed</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-white">Connect Firebase to enable accounts</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Copy <code className="text-accent">.env.example</code> to <code className="text-accent">.env.local</code>, fill
          in your Firebase web app config, enable Google and Email/Password sign-in, create a Firestore database and
          deploy <code className="text-accent">firestore.rules</code>. Then restart <code>npm run dev</code>. The README
          has the steps.
        </p>
        <Link href="/demo" className="btn-ghost mt-6">
          View the demo portfolio meanwhile
        </Link>
      </div>
    </main>
  );
}
