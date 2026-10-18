import '@fontsource/space-grotesk/300.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import '@/styles/landing.css';

import Navbar from '@/components/SpaceScope/Navbar';
import LandingHero from '@/components/SpaceScope/LandingHero';
import SkyStars from '@/components/SpaceScope/SkyStars';
import DataStrip from '@/components/SpaceScope/DataStrip';
import ARSkyView from '@/components/SpaceScope/ARSkyView';
import InteractiveGlobe from '@/components/SpaceScope/InteractiveGlobe';
import TimeRewind from '@/components/SpaceScope/TimeRewind';
import Toolkit from '@/components/SpaceScope/Toolkit';
import MissionTimeline from '@/components/SpaceScope/MissionTimeline';
import LearningZone from '@/components/SpaceScope/LearningZone';
import FinalCTA from '@/components/SpaceScope/FinalCTA';
import Manifesto from '@/components/SpaceScope/Manifesto';
import ClickSpark from '@/components/react-bits/ClickSpark';
import Footer from '@/components/SpaceScope/Footer';
import { useSmoothScroll } from '@/components/SpaceScope/gsap';

const Index = () => {
  useSmoothScroll();

  return (
    <ClickSpark sparkColor={["#c9b6ff", "#ff8fb8", "#ffb48f"]} sparkCount={9} sparkSize={9} sparkRadius={22} duration={650} className="landing relative min-h-screen overflow-x-clip">
      <div className="l-grain" aria-hidden="true" />
      <Navbar />

      <main>
        <LandingHero />

        {/* Dusk fades into night as the page scrolls */}
        <div className="relative bg-[linear-gradient(180deg,var(--l-dusk)_0%,var(--l-night-2)_1100px,var(--l-night)_2600px)]">
          <SkyStars />
          <div className="pointer-events-none absolute left-[-20%] top-[900px] h-[700px] w-[700px] rounded-full bg-[radial-gradient(closest-side,rgba(139,107,220,0.22),transparent)]" />
          <div className="pointer-events-none absolute right-[-20%] top-[2600px] h-[800px] w-[800px] rounded-full bg-[radial-gradient(closest-side,rgba(255,143,184,0.12),transparent)]" />

          <DataStrip />
          <Manifesto />
          <ARSkyView />
          <InteractiveGlobe />
          <TimeRewind />
          <Toolkit />
          <MissionTimeline />
          <LearningZone />
          <FinalCTA />
        </div>
      </main>

      <Footer />
    </ClickSpark>
  );
};

export default Index;
