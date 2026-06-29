// types/mentor.ts
// Responsibility: Types for AI Mentor conversations and sessions.

export interface MentorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface MentorSession {
  id: string;
  userId: string;
  messages: MentorMessage[];
  createdAt: string;
}
