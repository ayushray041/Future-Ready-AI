// services/gemini.service.ts
// Responsibility: Wrapper around Google Gemini API calls.
// All AI prompt construction and response parsing lives here.
// Never call this from components or pages directly.

export const geminiService = {
  async generateResponse(_prompt: string): Promise<string> {
    // Module 2: integrate @google/generative-ai SDK
    return '';
  },
};
