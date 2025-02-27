import Appbar from "@/components/Appbar";
import ChatBot from "@/components/Chatbot";
import Hero from "@/components/Hero";
import HeroCard from "@/components/HeroCard";
import HeroSearch from "@/components/HeroSearch";

export default function Page() {
  return (
    <div
      className="min-h-screen lg:h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0) -50%, #fdfcf7 110%), url('/place.jpg')`,
      }}
    >
      <Appbar />

      <div className="flex flex-col lg:flex-row w-full h-full px-8 py-24 lg:px-24 gap-6 md:gap-10">
        <Hero />

        <div className="flex flex-col flex-1 gap-6 md:gap-10">
          <div className="flex-1">
            <HeroCard />
          </div>
          <HeroSearch />
        </div>
      <ChatBot/>
      </div>
    </div>
  );
}

