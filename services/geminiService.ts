
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData, ColumnConfig } from "../types";

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

/**
 * Extracts structured contact data from a base64 encoded image based on a dynamic column configuration.
 * @param base64Image The base64 encoded image data, without the data URL prefix.
 * @param columnConfig The configuration of columns to extract.
 * @returns A promise that resolves to an object containing the extracted data.
 */
export const extractDataFromImage = async (base64Image: string, columnConfig: ColumnConfig[]): Promise<ExtractedData> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };

  const fieldDescriptions = columnConfig.map(c => c.header).join(', ');
  const textPart = {
    text: `Analyze the image to find contact information. Extract the following fields: ${fieldDescriptions}. If a field is not present, it should be omitted from the JSON output.`,
  };

  // Dynamically define the expected JSON structure for the AI's response
  const schemaProperties = columnConfig.reduce((acc, col) => {
    acc[col.key] = {
      type: Type.STRING,
      description: `The ${col.header}.`,
    };
    return acc;
  }, {} as { [key: string]: { type: Type, description: string } });
  
  const schema = {
    type: Type.OBJECT,
    properties: schemaProperties,
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    const jsonString = response.text.trim();
    if (!jsonString) {
      return {}; // Return empty object if the AI response is empty
    }

    // Safely parse the JSON response from the model
    try {
      const parsedJson = JSON.parse(jsonString);
      return parsedJson as ExtractedData;
    } catch (e) {
      console.error("Failed to parse JSON response from AI:", jsonString);
      // If parsing fails, return an empty object to avoid crashing the app
      return {};
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
            throw new Error('The provided API key is invalid. Please check your configuration.');
        }
        throw new Error(`An API error occurred: ${error.message}`);
    } else {
        throw new Error("An unknown error occurred while communicating with the AI service.");
    }
  }
};