'use client';

import AboutUsHero from '@/features/about/components/AboutUsHero';
import HowQuickHireWorks from '@/features/about/components/HowQuickHireWorks';
import WhoWeServeSection from '@/features/about/components/WhoWeServeSection';
import WhoWeAreFullSection from '@/features/about/components/WhoWeAreFullSection';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col">
        <AboutUsHero />
        <HowQuickHireWorks hideVideo={true} />
        <WhoWeServeSection />
        <WhoWeAreFullSection />
      </div>
    </div>
  );
}
