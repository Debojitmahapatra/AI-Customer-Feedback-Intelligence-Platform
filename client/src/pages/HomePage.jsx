import {
  ArrowRight,
  BarChart3,
  Check,
  MessageSquareText,
  Sparkles,
  Tags,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: MessageSquareText,
    title: "Bring every voice together",
    description:
      "Collect feedback from conversations, surveys, and support in one clear workspace.",
  },
  {
    icon: Tags,
    title: "Spot the themes that matter",
    description:
      "Turn recurring requests and pain points into themes your whole team can understand.",
  },
  {
    icon: BarChart3,
    title: "Make decisions with context",
    description:
      "See what customers are asking for and give product decisions a stronger foundation.",
  },
];

function HomePage() {
  return (
    <div className="overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-12">
        <section className="grid items-center gap-12 lg:grid-cols-[1fr_0.95fr] lg:gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
              <Sparkles size={14} />
              Customer feedback, made useful
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Listen closely.
              <span className="block text-cyan-300">Build what matters.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              LOOP brings customer feedback into focus, helping your team spot
              patterns, understand what people need, and make better product
              decisions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                to="/register"
              >
                Get started for free
                <ArrowRight size={17} />
              </Link>
              <Link
                className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
                to="/login"
              >
                Sign in
              </Link>
            </div>
            <div className="mt-7 flex items-center gap-2 text-sm text-slate-500">
              <Check className="text-cyan-400" size={16} />
              A clearer picture of what your customers need
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2rem] bg-cyan-400/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 p-2 shadow-2xl shadow-black/30">
              <img
                alt="Product team sharing ideas around a table"
                className="h-72 w-full rounded-xl object-cover sm:h-[25rem]"
                height="800"
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85"
                width="1200"
              />
              <div className="absolute inset-x-5 bottom-5 rounded-xl border border-white/10 bg-slate-950/90 p-4 shadow-xl backdrop-blur sm:inset-x-7 sm:bottom-7 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-300">
                      A customer insight
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-white sm:text-base">
                      “I’d love a simpler way to see my team’s progress.”
                    </p>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                    <MessageSquareText size={18} />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="text-xs text-slate-400">Product feedback</span>
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    Theme identified
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -right-3 top-6 hidden items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 shadow-xl sm:flex">
              <Zap className="text-amber-300" size={17} />
              <span className="text-sm font-medium text-slate-200">
                From feedback to focus
              </span>
            </div>
          </div>
        </section>

        <section className="mt-24 border-t border-slate-800 pt-14 sm:mt-28 sm:pt-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-400">
              One place for the bigger picture
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Less noise. More meaningful progress.
            </h2>
            <p className="mt-4 leading-7 text-slate-400">
              Feedback is most valuable when it doesn’t get lost. LOOP helps
              connect individual comments to the needs and opportunities behind
              them.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-cyan-400/30"
                key={title}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <Icon size={21} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 grid overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 md:grid-cols-2 sm:mt-24">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
              <Users size={21} />
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Give your whole team a voice.
            </h2>
            <p className="mt-4 leading-7 text-slate-400">
              Product, support, and success teams all hear different parts of
              the story. Bring those perspectives together and make customer
              needs part of every conversation.
            </p>
            <Link
              className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
              to="/register"
            >
              Create your workspace
              <ArrowRight size={16} />
            </Link>
          </div>
          <img
            alt="Colleagues collaborating in a bright workspace"
            className="h-64 w-full object-cover md:h-full md:min-h-80"
            height="800"
            loading="lazy"
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85"
            width="1200"
          />
        </section>

        <section className="mt-20 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-slate-900 to-slate-900 px-6 py-10 text-center sm:mt-24 sm:px-12 sm:py-14">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-cyan-300">
            Start with your customers
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Turn what you hear into what you build.
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">
            Create a home for customer feedback and help your team find its next
            best move.
          </p>
          <Link
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            to="/register"
          >
            Get started
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
