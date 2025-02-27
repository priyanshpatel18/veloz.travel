"use client"
import React, { useState, useEffect } from 'react';
import Appbar from '../../components/Appbar';

function Dest() {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [Lat, setLat] = useState<number | null>(null);
  const [Log, setLog] = useState<number | null>(null);

  const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();

      if (data && data.display_name) {
        return data.display_name; // Returns the formatted address
      } else {
        throw new Error("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      return "Unknown location";
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLog(longitude);
      });
    }
  }, []);

  useEffect(() => {
    if (Lat !== null && Log !== null) {
      getLocationName(Lat, Log).then(setFromLocation);
    }
  }, [Lat, Log]); // Fetch location name when Lat & Log are updated

  return (
    <div
      className="min-h-screen lg:h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0) -50%, #fdfcf7 110%), url('/place.jpg')`,
      }}
    >
      <Appbar />

      <div className="flex flex-col lg:flex-row w-full h-full px-8 py-24 lg:px-24 gap-6 md:gap-10">
        <div className="w-full m-8 bg-white h-full rounded-3xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Enter Destination</h2>

          <label className="block text-gray-700">From:</label>
          <input
            type="text"
            value={fromLocation}
            readOnly
            className="w-full p-2 border rounded mt-2 bg-gray-100 cursor-not-allowed"
          />

          <label className="block text-gray-700 mt-4">To:</label>
          <input
            type="text"
            value={toLocation}
            onChange={(event) => setToLocation(event.target.value)}
            className="w-full p-2 border rounded mt-2"
            placeholder="Enter destination"
          />
        </div>
      </div>
    </div>
  );
} 

export default Dest;
