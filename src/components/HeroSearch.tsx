"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { PlaceholdersAndVanishInput as AceternityInput } from "./ui/placeholders-and-vanish-input";

function HeroSearch() {
  const [search, setSearch] = useState("");

  return (
    <div className="bg-white backdrop-blur-lg p-6 md:p-12 py-10 md:py-16 rounded-2xl shadow-lg w-full">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">Where</h2>
      <p className="text-sm md:text-base">Enter your destination</p>
      <PlaceholdersAndVanishInputDemo search={search} setSearch={setSearch} />
    </div>
  );
}

export default HeroSearch;

interface PlaceholdersAndVanishInputProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}

function PlaceholdersAndVanishInputDemo({ search, setSearch }: PlaceholdersAndVanishInputProps) {
  const placeholders = [
    "Where's the best street food in Bangkok?",
    "Which rooftop bar in New York has the best view?",
    "Take me to a breathtaking viewpoint in Santorini!",
    "Find a peaceful beach getaway near Goa.",
    "What’s a must-visit historical site in Rome?"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <div className="flex flex-col justify-center items-center">
      <AceternityInput
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}
