import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroCard = () => {
  return (
    <div className="h-full flex flex-col justify-center bg-white p-6 md:p-8 rounded-3xl">
      <div className="space-y-6 w-full md:w-[80%]">
        <h1 className="text-4xl md:text-7xl font-bold text-gray-900">
          Take a Break
        </h1>
        <p className="text-gray-700 text-lg md:text-xl">
          Indulge in the freedom of exploration with an effortless booking platform.
        </p>
        <Button
          className="mt-5 px-5 md:px-7 py-4 md:py-5 text-lg rounded-full bg-white/60 text-gray-900 border-black border-[2px] hover:bg-black hover:text-white transition-all"
        >
          Explore new places
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default HeroCard;