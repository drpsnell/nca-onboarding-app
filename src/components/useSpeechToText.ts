"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionConstructor = new () => any;

export function useSpeechToText() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition: SpeechRecognitionConstructor | undefined =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const start = useCallback(() => {
    if (!supported || !recognitionRef.current) return;
    setTranscript("");
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      // swallow start errors when already started
    }
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported || !recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // swallow
    }
    setListening(false);
  }, [supported]);

  const reset = useCallback(() => {
    setTranscript("");
  }, []);

  return { supported, listening, transcript, start, stop, reset };
}



