import { Montserrat } from "next/font/google";
import Image from "next/image";
import { Button } from "./ui/button";
import { ArrowUpRight, MapPin } from "lucide-react";

const mont = Montserrat({ subsets: ["latin"] });

const places = [
  { name: "Solang Valley", distance: "12 km" },
  { name: "Beas River", distance: "5 km" },
  { name: "Hidimba Devi Temple", distance: "3 km" }
];

export default function Hero() {
  return (
    <div
      className={`w-full lg:w-2/3 rounded-3xl flex flex-col justify-between overflow-hidden group relative ${mont.className}`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{
          backgroundImage: `url('/place.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />

      {/* Title */}
      <div className="relative z-10 p-6 md:p-8">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md w-fit px-4 py-2 rounded-full">
          <Image
            src="/india.png"
            alt="Logo"
            width={32}
            height={32}
            className="rounded-full"
          />
          <h1 className="font-bold text-2xl md:text-4xl text-white uppercase tracking-wide">
            Manali
          </h1>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 text-white flex flex-col md:flex-row justify-between border-t border-white/20 bg-black/20 backdrop-blur-sm">
        <div className="w-full md:w-1/2 p-6 md:p-10">
          <h2 className="text-lg font-medium text-white/70">About</h2>
          <p className="text-white/60 text-sm md:text-base">
            A gift of the Himalayas to the world, Manali is a beautiful township nestled in the picturesque Beas River valley.
          </p>
          <Button variant="secondary" className="mt-4">
            <div className="flex items-center">
              Learn More
              <ArrowUpRight className="ml-2 w-4 h-4" />
            </div>
          </Button>
        </div>

        <div className="hidden md:block w-[1px] bg-white/20" />

        <div className="w-full md:w-1/2 p-6 md:p-10">
          <h2 className="font-bold text-2xl md:text-3xl mb-4">Popular Places</h2>
          <div className="space-y-2">
            {places.map((place, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-between text-white"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white/60" />
                  {place.name}
                </div>
                <span className="text-sm text-white/60">
                  {place.distance}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
