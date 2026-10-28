import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="heading mt-3">This page doesn&apos;t exist (yet)</h1>
        <p className="mt-3 text-slate-400">The profile may be a draft, or the name is still up for grabs.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/login" className="btn-primary">
            Claim it
          </Link>
          <Link href="/" className="btn-ghost">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
