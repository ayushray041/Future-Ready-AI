'use client';
// hooks/useMentor.ts
// Manages AI Mentor conversation state.
// - Loads / creates Firestore session on mount
// - Sends messages to /api/mentor (server-side Gemini)
// - Persists every exchange back to Firestore

import { useState, useCallback, useRef } from 'react';
import {
  getActiveSession,
  createSession,
  appendMessages,
  resetSession,
} from '@/services/mentor.service';
import type { MentorMessage, MentorSession, UserProfile } from '@/types';

// Build a Gemini-format history array from stored messages
function toGeminiHistory(messages: MentorMessage[]) {
  return messages.map(m => ({
    role:  m.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: m.content }],
  }));
}

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

interface UseMentorReturn {
  messages:     MentorMessage[];
  loading:      boolean;
  error:        string;
  sessionReady: boolean;
  sendMessage:  (text: string) => Promise<void>;
  clearChat:    () => Promise<void>;
  initSession:  (uid: string) => Promise<void>;
}

export function useMentor(profile: UserProfile | null): UseMentorReturn {
  const [messages,     setMessages]     = useState<MentorMessage[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const sessionRef = useRef<MentorSession | null>(null);

  // ── Initialise (load or create) Firestore session ──────────
  const initSession = useCallback(async (uid: string) => {
    try {
      let s = await getActiveSession(uid);
      if (!s) s = await createSession(uid);
      sessionRef.current = s;
      setMessages(s.messages);
      setSessionReady(true);
    } catch (e) {
      console.error('[useMentor] initSession', e);
      setSessionReady(true); // still allow chatting; just won't persist
    }
  }, []);

  // ── Send a message ─────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: MentorMessage = {
      id:        makeId(),
      role:      'user',
      content:   text,
      timestamp: new Date().toISOString(),
    };

    const history      = [...messages];          // snapshot before adding user msg
    const withUser     = [...history, userMsg];
    setMessages(withUser);
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/mentor', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: toGeminiHistory(history),    // prior turns only
          profile: profile ?? {},
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      const assistantMsg: MentorMessage = {
        id:        makeId(),
        role:      'assistant',
        content:   data.reply,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...withUser, assistantMsg];
      setMessages(finalMessages);

      // Persist to Firestore
      if (sessionRef.current) {
        await appendMessages(sessionRef.current.id, finalMessages);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to get a response';
      setError(msg);
      // Remove the optimistically-added user message on failure
      setMessages(history);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, profile]);

  // ── Clear / reset ──────────────────────────────────────────
  const clearChat = useCallback(async () => {
    setMessages([]);
    setError('');
    if (sessionRef.current && profile?.uid) {
      await resetSession(sessionRef.current.id, profile.uid);
    }
  }, [profile]);

  return { messages, loading, error, sessionReady, sendMessage, clearChat, initSession };
}