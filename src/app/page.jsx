import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import Stats from '@/components/sections/Stats';
import HowItWorks from '@/components/sections/HowItWorks';
import TopicsShowcase from '@/components/sections/TopicsShowcase';
import LiveQuizDemo from '@/components/sections/LiveQuizDemo';
import BadgesRewards from '@/components/sections/BadgesRewards';
import ClassSelector from '@/components/sections/ClassSelector';
import Testimonials from '@/components/sections/Testimonials';
import CTASection from '@/components/sections/CTASection';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <TopicsShowcase />
        <LiveQuizDemo />
        <BadgesRewards />
        <ClassSelector />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
