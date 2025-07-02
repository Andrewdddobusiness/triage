"use server";

interface PlaceAutocompleteResponse {
  suggestions: Array<{
    placePrediction: {
      place: string; // Place resource name
      placeId: string;
      text: {
        text: string;
        matches: Array<{
          endOffset: number;
        }>;
      };
      structuredFormat: {
        mainText: {
          text: string;
          matches: Array<{
            endOffset: number;
          }>;
        };
        secondaryText: {
          text: string;
          matches: Array<{
            endOffset: number;
          }>;
        };
      };
      types: string[];
    };
  }>;
}

export async function getPlaceAutocomplete(input: string): Promise<{
  predictions: Array<{
    place_id: string;
    description: string;
    main_text: string;
    secondary_text: string;
    types: string[];
  }>;
  error?: string;
  debug?: any;
}> {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return { 
        predictions: [], 
        error: "Google Maps API key is not configured. Please add GOOGLE_MAPS_API_KEY to your environment variables." 
      };
    }

    if (!input || input.length < 2) {
      return { predictions: [] };
    }

    console.log('🔍 Making Google Places API (New) request for:', input);

    // Use the new Places API (New) endpoint
    const url = "https://places.googleapis.com/v1/places:autocomplete";
    
    // Request body for the new API
    const requestBody = {
      input: input,
      includedPrimaryTypes: ["locality", "administrative_area_level_1", "administrative_area_level_2"],
      regionCode: "AU", // Bias results to Australia
      languageCode: "en",
      sessionToken: Math.random().toString(36).substring(2)
    };

    console.log('🌐 API URL:', url);
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY!,
        "X-Goog-FieldMask": "suggestions.placePrediction.place,suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.types"
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Response error:', errorText);
      
      // Handle specific error codes for the new API
      let errorMessage = `Places API (New) error: ${response.status}`;
      
      switch (response.status) {
        case 400:
          errorMessage += " - Bad Request: Invalid request parameters";
          break;
        case 401:
          errorMessage += " - Unauthorized: Invalid API key";
          break;
        case 403:
          errorMessage += " - Forbidden: API key may not have Places API enabled, or billing not set up";
          break;
        case 429:
          errorMessage += " - Too Many Requests: Quota exceeded";
          break;
        default:
          errorMessage += ` - ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data: PlaceAutocompleteResponse = await response.json();
    console.log('📊 API Response:', { suggestions_count: data.suggestions?.length });

    // The new API doesn't use status codes, errors are HTTP status codes
    if (!data.suggestions) {
      return { predictions: [] };
    }

    const predictions = data.suggestions.map(suggestion => {
      const placePrediction = suggestion.placePrediction;
      return {
        place_id: placePrediction.placeId,
        description: placePrediction.text.text,
        main_text: placePrediction.structuredFormat.mainText.text,
        secondary_text: placePrediction.structuredFormat.secondaryText?.text || '',
        types: placePrediction.types || [],
      };
    });

    return { predictions };

  } catch (error) {
    console.error("❌ Error fetching place autocomplete:", error);
    return { 
      predictions: [],
      error: error instanceof Error ? error.message : "Failed to fetch autocomplete suggestions",
      debug: { error: error instanceof Error ? error.message : error }
    };
  }
}