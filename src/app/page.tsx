import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/Icons";
import { SearchBox } from "@/components/SearchBox";
import { SITE_URL } from "@/lib/firebase";

const host = SITE_URL.replace(/^https?:\/\//, "");

const features = [
  {
    title: "Resume → website",
    body: "Fill in your experience, skills and projects once. Portfolio turns it into a polished one-page site.",
  },
  {
    title: "Your own link",
    body: `Claim a short handle like ${host}/yourname and put it on your resume, LinkedIn and email signature.`,
  },
  {
    title: "Live preview",
    body: "Every edit shows up instantly in the preview. Publish when it looks right, unpublish any time.",
  },
  {
    title: "Public or private",
    body: "Public pages can be found by city or ZIP. Private pages need your link and a password you choose.",
  },
  {
    title: "Make it yours",
    body: "Light and dark modes, an accent colour, your photo, background image, resume and meeting links.",
  },
  {
    title: "Shareable previews",
    body: "Proper titles and social cards, so your link looks good when shared on LinkedIn or X.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-ink-950">P</span>
          Portfolio
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/search" className="btn hidden text-slate-300 hover:text-white sm:inline-flex">
            Find people
          </Link>
          <Link href="/demo" className="btn text-slate-300 hover:text-white">
            Demo
          </Link>
          <Link href="/login" className="btn-ghost">
            Sign in
          </Link>
        </nav>
      </header>

      <section className="relative">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-20 text-center sm:px-6 md:pt-28">
          <p className="eyebrow">Portfolio builder</p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
            Your resume,
            <br />
            <span className="bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
              as a portfolio site.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Build a beautiful personal page with your experience, skills and projects — and share it with one
            link. Free, and ready in about ten minutes.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="btn-primary px-7 py-3 text-base">
              Create your page
            </Link>
            <Link href="/demo" className="btn-ghost px-7 py-3 text-base">
              See an example <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-6 font-mono text-sm text-slate-500">
            {host}/<span className="text-accent">yourname</span>
          </p>
          <div className="mx-auto mt-14 max-w-2xl text-left">
            <p className="mb-3 text-center text-sm text-slate-400">Looking for someone? Search public profiles near you.</p>
            <SearchBox />
          </div>
        </div>
      </section>

      <section className="section pt-0 md:pt-0">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <h3 className="font-display text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section pt-0 md:pt-0">
        <div className="card px-6 py-12 text-center sm:px-12">
          <h2 className="heading">Three steps</h2>
          <ol className="mx-auto mt-10 grid max-w-4xl gap-8 text-left sm:grid-cols-3">
            {[
              ["01", "Sign in", "With Google or email."],
              ["02", "Fill your profile", "Or start from the sample and edit."],
              ["03", "Publish & share", "Your page goes live instantly."],
            ].map(([n, t, b]) => (
              <li key={n}>
                <p className="font-mono text-sm text-accent">{n}</p>
                <p className="mt-2 font-display text-lg font-semibold text-white">{t}</p>
                <p className="mt-1 text-sm text-slate-400">{b}</p>
              </li>
            ))}
          </ol>
          <Link href="/login" className="btn-primary mt-10">
            Get started
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Portfolio
      </footer>
    </div>
  );
}
