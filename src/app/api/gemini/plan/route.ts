import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

async function generateTripPlan(prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch data from Gemini API');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response from Gemini');
  }

  return text;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { attractions, dateRange } = body;

    if (!attractions || !attractions.length) {
      return NextResponse.json(
        { error: 'Attractions are required' },
        { status: 400 }
      );
    }

    // Parse date range
    const dates = dateRange.split(' to ');
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[1]);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Format attractions for the prompt (keeping them as is)
    const attractionsText = attractions
      .map((att: { name: any; category: any; visitDuration: any; }) => `- ${att.name} (${att.category}): ${att.visitDuration}`)
      .join('\n');

    // Craft a prompt for Gemini
    const prompt = `
      Create an optimized daily travel itinerary for a ${days}-day trip during ${dateRange}.
      The itinerary should include the following attractions:
      
      ${attractionsText}
      
      For each day:
      1. Assign a logical combination of attractions that are geographically close when possible
      2. Consider visit duration to ensure a reasonable schedule
      3. Suggest a start time (usually morning) and end time for the day
      4. Distribute attractions evenly across all days when possible
      
      Format the response as a JSON array of daily plans, where each day includes:
      - day number
      - date (in YYYY-MM-DD format)
      - list of attractions (use the full attraction objects provided)
      - recommended start and end times
      
      Example format:
      {
        "plan": [
          {
            "day": 1,
            "date": "2025-04-25", // Use the correct date based on the date range
            "attractions": [
              // Include the complete attraction objects here
            ],
            "startTime": "9:00 AM",
            "endTime": "5:00 PM",
            "bestTime": "12:00 PM"
          },
          // More days...
        ]
      }
    `;

    const responseText = await generateTripPlan(prompt);

    const cleanedResponseText = responseText
      .trim()
      .replace(/^[^{]*/, '')
      .replace(/[^}]*$/, '')
      .replace(/\/\/.*\n/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    // Log the cleaned response for debugging
    console.log('Cleaned Gemini API response:', cleanedResponseText);

    // Parse the cleaned response
    const planData = JSON.parse(cleanedResponseText);

    if (planData.plan) {
      let attractionIndex = 0;

      planData.plan = planData.plan.map((day: any, index: number) => {
        // Assign attractions for each day
        const attractionsForDay = [];
        const numAttractionsPerDay = Math.ceil(attractions.length / days);

        // Loop over attractions, assigning them evenly across days
        for (let i = 0; i < numAttractionsPerDay; i++) {
          if (attractionIndex < attractions.length) {
            attractionsForDay.push(attractions[attractionIndex]);
            attractionIndex++;
          }
        }

        // Generate day-specific details like start and end times
        const startTime = `9:00 AM`;
        const endTime = `5:00 PM`;

        return {
          ...day,
          attractions: attractionsForDay,
          date: new Date(day.date), // Ensure date format
          startTime,
          endTime,
        };
      });
    }

    // Return the response
    return NextResponse.json(planData);
  } catch (error) {
    console.error('Error in plan API:', error);
    return NextResponse.json(
      { error: 'Failed to create trip plan' },
      { status: 500 }
    );
  }
}
