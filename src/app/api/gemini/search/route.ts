import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

async function getPhotosForLocation(location: string) {
  // Get photos for the location directly
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${location}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
  );
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    return data.results;
  }

  throw new Error('No photos found for location');
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const body = await request.json();
    const { destination, dateRange } = body;

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    const prompt = `
    Generate a list of popular tourist attractions in ${destination} for a trip during ${dateRange} (approximately 14 days).
    Distribute the attractions evenly over the course of the two-week trip, considering the following:
    - Include a variety of attractions (e.g., landmarks, museums, parks, historical sites, etc.).
    - If the destination is a large area (e.g., a state or major city), include more attractions (around 2-3 per day) for a diverse experience.
    - If the destination is a smaller area (e.g., a district or small city like Ahmedabad), focus on fewer attractions (around 1-2 per day).
    - Ensure the attractions are evenly distributed throughout the trip, but avoid overwhelming the traveler with too many attractions on a single day.
    - Provide details for each attraction as follows:
      - A unique ID
      - Name
      - A brief description (1-2 sentences)
      - Category (e.g., Landmark, Museum, Park, etc.)
      - Rating out of 5
      - Recommended visit duration
      - Best time to visit (e.g., morning, afternoon, evening)
      - Latitude and longitude (coordinates of the location)
  
    The result should be formatted as a JSON array of attraction objects, and the data should be distributed across the 14-day period. Here's an example format:
    
    [
      {
        "id": "unique-id-1",
        "name": "Attraction Name",
        "description": "Brief description of the attraction.",
        "category": "Category",
        "rating": 4.5,
        "visitDuration": "2-3 hours",
        "bestTime": "Morning",
        "location": {
          "latitude": 37.7749,
          "longitude": -122.4194
        }
      },
      ...
    ]
    
    Ensure that the data is well-distributed and includes both well-known and hidden gems for a rich travel experience. For smaller destinations, make sure the list highlights the most notable and unique places, while avoiding redundancy.
`;

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

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini');
    }

    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse attraction data from AI response');
    }

    const attractions = JSON.parse(jsonMatch[0]);

    const updatedAttractions = await Promise.all(attractions.map(async (attraction: { name: string; image: any; }) => {
      // const photos = await getPhotosForLocation(attraction.name);

      // const match = photos.find((photo: { description: any; alt_description: any; tags: any[]; }) => {
      //   const text = `${photo.description ?? ''} ${photo.alt_description ?? ''} ${photo.tags?.map((t: { title: any; }) => t.title).join(' ')}`;
      //   return text.toLowerCase().includes(attraction.name.toLowerCase());
      // });

      // attraction.image = match?.urls?.regular ?? photos[0]?.urls?.regular;
      return attraction;
    }));

    console.log(updatedAttractions);
    
    return NextResponse.json({ attractions: updatedAttractions });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Failed to search attractions' },
      { status: 500 }
    );
  }
}
