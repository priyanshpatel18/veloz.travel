"use client";

import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, SearchIcon, Send, X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from "react-markdown";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../components/ui/drawer';

interface Message {
  role: 'user' | 'model';
  text: string;
  id: string;
}

export default function ChatBot() {
  const [query, setQuery] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Travel-related keywords to check against
  const travelKeywords = [
    'travel', 'trip', 'vacation', 'holiday', 'tour', 'flight', 'hotel',
    'destination', 'accommodation', 'tourism', 'tourist', 'beach', 'resort',
    'booking', 'itinerary', 'sightseeing', 'adventure', 'backpacking',
    'cruise', 'passport', 'visa', 'airport', 'luggage', 'excursion',
    'guide', 'city', 'country', 'landmark', 'attraction', 'transportation',
    'train', 'bus', 'taxi', 'car rental', 'camping', 'hiking', 'road trip',
    'airline', 'lounge', 'checkin', 'checkout', 'reservation', 'places to visit',
    'where to go', 'when to visit', 'how to get', 'best time', 'budget',
    'goa', 'delhi', 'mumbai', 'bangkok', 'paris', 'london', 'new york', 'tokyo',
    'bali', 'phuket', 'singapore', 'dubai', 'hong kong', 'rome', 'venice',
    'barcelona', 'madrid', 'amsterdam', 'berlin', 'vienna', 'prague',
    'hotel', 'hostel', 'airbnb', 'resort', 'motel', 'homestay'
  ];

  // Function to check if query is travel-related
  const isTravelRelated = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return travelKeywords.some(keyword => lowerText.includes(keyword));
  };

  const generateBotResponse = async (userMessage: string) => {
    setIsThinking(true);
    setIsTyping(true);

    // Add the user message to the messages array
    setMessages(prev => [...prev, { role: 'user', text: userMessage, id: Date.now().toString() }]);

    // Check if the query is travel-related
    if (!isTravelRelated(userMessage)) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'model',
          text: "I'm a travel assistant and can only answer questions related to travel, trips, destinations, accommodations, flights, or other travel-related topics. How can I help with your travel plans?",
          id: Date.now().toString()
        }]);
        setIsTyping(false);
        setIsThinking(false);
      }, 800);
      return;
    }

    try {
      // Create a simpler request structure that matches Gemini API expectations
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `You are a travel assistant that only provides information about travel, 
                                destinations, accommodations, flights, itineraries, and other travel-related topics. 
                                The user query is: ${userMessage}`
              }
            ]
          }
        ]
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        console.error("API Error Status:", response.status);
        console.error("API Error Text:", await response.text());
        throw new Error("API request failed");
      }

      const data = await response.json();

      // Check if data has the expected structure
      if (!data.candidates || !data.candidates[0]?.content?.parts || !data.candidates[0]?.content?.parts[0]?.text) {
        console.error("Unexpected API response structure:", JSON.stringify(data));
        throw new Error("Unexpected API response format");
      }

      const botReply: string = data.candidates[0].content.parts[0].text.trim();

      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'model', text: botReply, id: Date.now().toString() }]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching bot response:", error);

      // Provide travel-related fallback responses for different error scenarios
      const fallbackResponses = [
        "I'm having trouble accessing my travel database at the moment. Could you try asking about your trip again in a different way?",
        "Looks like our travel server is experiencing some delays. How else can I help with your travel plans today?",
        "I'm sorry, I couldn't process your travel question right now. Feel free to ask about another destination or travel topic.",
        "My travel information system is temporarily unavailable. While we wait, could you tell me more about what type of trip you're planning?",
        "There seems to be a connection issue with our travel database. In the meantime, I'd be happy to discuss general travel tips if you're interested."
      ];

      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      setMessages(prev => [...prev, {
        role: 'model',
        text: randomFallback,
        id: Date.now().toString()
      }]);
      setIsTyping(false);
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      const userMessage = query;
      setQuery('');
      setTimeout(() => {
        generateBotResponse(userMessage);
      }, 100);
    }
  };

  const TypingIndicator = () => (
    <motion.div
      className="flex gap-1 items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 bg-[#232323] rounded-full"
          animate={{
            y: ["0%", "-100%", "0%"],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </motion.div>
  );

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'model',
        text: "Hi there! I'm your travel assistant. I can help with trip planning, destination recommendations, flight and hotel information, and other travel-related questions. How can I assist with your travel plans today?",
        id: "welcome-message"
      }]);
    }
  }, []);

  // Function to handle API errors with a fallback mechanism
  const handleOfflineResponse = (userQuery: string): string => {
    const lowerQuery = userQuery.toLowerCase();

    // Common destinations
    if (lowerQuery.includes('goa')) {
      return "Goa is a popular beach destination in India known for its beautiful beaches, vibrant nightlife, and Portuguese-influenced architecture. The best time to visit is between November and February. Popular beaches include Baga, Calangute, and Anjuna. Don't miss trying the fresh seafood and local Goan cuisine!";
    }

    if (lowerQuery.includes('trip') || lowerQuery.includes('vacation')) {
      return "When planning a trip, consider factors like your budget, travel duration, preferred activities, and the best season to visit. I recommend making a checklist of essentials like travel documents, accommodations, transportation, and a rough itinerary while leaving room for spontaneous activities.";
    }

    if (lowerQuery.includes('hotel') || lowerQuery.includes('stay')) {
      return "When booking accommodations, consider location, budget, amenities, and reviews. For the best rates, try booking in advance or during off-peak seasons. Many hotels offer discounts for longer stays or through loyalty programs.";
    }

    if (lowerQuery.includes('flight') || lowerQuery.includes('air')) {
      return "For the best flight deals, try booking 1-3 months in advance and be flexible with your travel dates if possible. Use flight comparison websites and consider flying on weekdays rather than weekends. Don't forget to check baggage allowances and airport transfer options at your destination.";
    }

    // Default response
    return "That sounds like an interesting travel topic. To give you the best advice, could you provide more details about your specific travel plans, destination, or what aspect of travel you're most interested in?";
  };

  return (
    <div className="fixed bottom-8 right-10">
      <Drawer>
        <DrawerTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="bg-[#232323] text-white rounded-full w-16 h-16 flex items-center justify-center">
              <SearchIcon className="h-6 w-6" />
            </Button>
          </motion.div>
        </DrawerTrigger>

        <DrawerContent className="h-full w-1/3 right-4 left-auto fixed rounded-3xl p-4">
          <motion.div
            className="flex flex-col h-full dark:bg-[#232323] rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DrawerHeader className="border-b px-3 py-2">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-base font-semibold flex items-center gap-2">
                  Travel Assistant
                </DrawerTitle>
                <DrawerClose asChild>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-3 space-y-3">

              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{
                      opacity: 0,
                      x: message.role === 'user' ? 20 : -20,
                      scale: 0.95
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <MessageBubble message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {isTyping && <TypingIndicator />}
              </AnimatePresence>
            </div>

            <DrawerFooter className="border-t p-3">
              <form onSubmit={handleSubmit}>
                <div className='flex bg-[#232323] rounded-xl px-2 py-1'>
                  <motion.div
                    className='bg-[#232323] rounded-lg flex-1 flex items-center px-2 py-1'
                    whileFocus={{ scale: 1.02 }}
                  >
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask about travel..."
                      className="flex-1 h-9 text-sm bg-transparent outline-none text-white border-none placeholder-gray-400"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="submit"
                      size="sm"
                      className="transition-all duration-300 text-white bg-[#232323] rounded-xl h-10 w-10 p-0 disabled:opacity-50"
                      disabled={isThinking || !query.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </form>
            </DrawerFooter>
          </motion.div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

const MessageBubble = ({ message }: { message: Message }) => {
  return (
    <motion.div
      className={`max-w-[80%] rounded-lg px-3 py-1.5 text-sm 
        ${message.role === "user"
          ? "bg-[#232323] rounded-xl text-white"
          : "bg-[#232323] rounded-xl text-white"
        }`}
    >
      <ReactMarkdown>{message.text}</ReactMarkdown>
    </motion.div>
  );
};
