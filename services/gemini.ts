import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, ConstructionStage } from "../types";

// NOTE: In a production app, never expose the API key in the frontend code directly if possible.
// However, per instructions, we access it via process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeConstructionUpdate = async (
  input: string,
  imageData?: string // Base64 string if an image is uploaded
): Promise<AIAnalysisResult> => {
  try {
    // Use gemini-2.5-flash for both text and multimodal analysis (text + image).
    // gemini-2.5-flash-image is specialized for image generation and does not support JSON mode / structured output.
    const model = 'gemini-2.5-flash';
    
    // Construct the parts
    const parts: any[] = [];
    
    if (imageData) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg', // Assuming JPEG for simplicity
          data: imageData
        }
      });
    }

    parts.push({
      text: `
        You are a smart construction site manager assistant.
        Analyze the provided site update (text and/or image) to determine the construction progress.

        **Goal**: Determine the 'suggestedStage' and identify specific 'detectedUnitIds' referenced in the update.

        **Allowed Construction Stages**:
        - Not Started
        - Foundation
        - Structure
        - Brickwork
        - Electrical Conduits
        - Plumbing (Internal)
        - Plumbing (External)
        - Firefighting Systems
        - Plaster (Internal)
        - Plaster (External)
        - UPVC Windows/Doors
        - Railing Work
        - Flooring Tiles
        - Bathroom Tiles
        - Painting (Internal)
        - Painting (External)
        - Handover Ready

        **Unit ID Extraction Rules**:
        - Extract specific Unit IDs if mentioned (e.g., "101", "504", "1202").
        - If a range is stated (e.g., "Units 401 through 404"), list all implied IDs (401, 402, 403, 404).
        - If a specific floor is mentioned (e.g., "3rd floor is done"), infer standard unit IDs for that floor if common conventions apply (e.g., 301, 302, 303, 304).
        - **CRITICAL**: If the update is general (e.g., "Site looks good", "Project on track") and no specific units or floors are mentioned, strictly return an empty array [] for detectedUnitIds. Do not guess or hallucinate IDs.

        **Summary**:
        - Provide a professional, concise 1-sentence summary of the update suitable for a client log.

        **Input**:
        User Input Text: "${input}"

        Respond strictly in JSON format conforming to the schema.
      `
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedStage: { type: Type.STRING, enum: Object.values(ConstructionStage) },
            confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1" },
            summary: { type: Type.STRING, description: "A brief professional summary of the update." },
            detectedUnitIds: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of unit IDs extracted from the text." 
            }
          },
          required: ["suggestedStage", "confidence", "summary", "detectedUnitIds"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as AIAnalysisResult;
    }
    
    throw new Error("No response text generated");
    
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback response in case of error
    return {
      suggestedStage: ConstructionStage.NOT_STARTED,
      confidence: 0,
      summary: "Could not analyze the update automatically. Please enter details manually.",
      detectedUnitIds: []
    };
  }
};