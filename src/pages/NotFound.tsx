import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

import '@/styles/landing.css';
import SkyStars from '@/components/SpaceScope/SkyStars';
import { Planet } from '@/components/SpaceScope/art/Planet';
import { Satellite } from '@/components/SpaceScope/art/Craft';

const NotFound = () => {
  const { pathname } = useLocation();

  return (
    <main className="landing relative grid min-h-screen place-items-center overflow-hidden bg-space-navy px-6 py-16 text-center">
      <SkyStars density={0.8} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_100%,hsl(var(--nebula-purple)/0.35),transparent)]" />

      <div className="relative z-10 max-w-xl">
        <div className="relative mx-auto mb-8 w-40 sm:w-52">
          <Planet variant="ember" ring className="w-full" />
          <Satellite className="absolute -right-6 top-2 w-20 rotate-12" />
        </div>
        <p className="font-heading text-sm font-semibold tracking-widest text-cosmic-glow">ERROR 404</p>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-star-white sm:text-6xl">Lost in orbit</h1>
        <p className="mt-4 text-muted-foreground">
          There is nothing at <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-star-white">{pathname}</code>. The page may have moved, or the link may be wrong.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="l-btn l-btn-light">
            Back to home
            <span className="l-btn-dot">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </Link>
          <Link to="/dashboard" className="l-btn rounded-full border border-white/25 px-7 py-3.5 text-star-white hover:bg-white/10">
            Open dashboard
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
