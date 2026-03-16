import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import NewsSection from "@/components/NewsSection";
import ObjectivesSection from "@/components/ObjectivesSection";
import CommitteeSection from "@/components/CommitteeSection";
import MembersSection from "@/components/MembersSection";
import AboutSection from "@/components/AboutSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <NewsSection />
      <ObjectivesSection />
      <CommitteeSection />
      <MembersSection />
      <AboutSection />
    </>
  );
}
