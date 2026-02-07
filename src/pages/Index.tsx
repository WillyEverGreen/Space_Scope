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

import Starfield from '@/components/SpaceScope/Starfield';
import FloatingParticles from '@/components/SpaceScope/FloatingParticles';
import Navbar from '@/components/SpaceScope/Navbar';
import Hero from '@/components/SpaceScope/Hero';
import ARSkyView from '@/components/SpaceScope/ARSkyView';
import InteractiveGlobe from '@/components/SpaceScope/InteractiveGlobe';
import TimeRewind from '@/components/SpaceScope/TimeRewind';
import MissionTimeline from '@/components/SpaceScope/MissionTimeline';
import LearningZone from '@/components/SpaceScope/LearningZone';
import FinalCTA from '@/components/SpaceScope/FinalCTA';
import Footer from '@/components/SpaceScope/Footer';

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background effects */}
      <Starfield />
      <FloatingParticles />
      
      {/* Noise overlay for film grain effect */}
      <div className="noise-overlay" />
      
      {/* Vignette effect */}
      <div className="vignette" />

      {/* Navigation */}
      <Navbar />

      {/* Main content */}
      <main className="relative z-10">
        <Hero />
        
        <div id="features">
          <ARSkyView />
        </div>
        
        <InteractiveGlobe />
        
        <TimeRewind />
        
        <div id="timeline">
          <MissionTimeline />
        </div>
        
        <div id="learn">
          <LearningZone />
        </div>
        
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
