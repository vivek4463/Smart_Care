"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Bot, Send } from "lucide-react";
import { motion } from "framer-motion";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

interface Props {
  currentEmotion?: string;
}

export default function VoiceAssistant({ currentEmotion }: Props) {

  const recognitionRef = useRef<any>(null);
  const recognitionActive = useRef(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState("");

  // Initialize speech recognition
  useEffect(() => {

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {

      const transcript = event.results[0][0].transcript;

      addMessage("user", transcript);

      generateReply(transcript);

    };

    recognition.onend = () => {
      recognitionActive.current = false;
      setIsListening(false);
    };

    recognition.onerror = () => {
      recognitionActive.current = false;
      setIsListening(false);
    };

    recognitionRef.current = recognition;

  }, []);

  // Add message to chat
  const addMessage = (role: "user" | "assistant", text: string) => {

    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        role,
        text
      }
    ]);

  };

  // Speak assistant response
  const speak = (text: string) => {

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    speechSynthesis.speak(utterance);

  };

  // Assistant response logic
  const generateReply = (input: string) => {

    const msg = input.toLowerCase();

    let reply = "";

    if (msg.includes("hello") || msg.includes("hi")) {

      reply = "Hello! How are you feeling today?";

    }

    else if (msg.includes("sad") || msg.includes("depressed")) {

      reply = "I'm sorry you're feeling sad. I recommend calming piano therapy music.";

    }

    else if (msg.includes("happy") || msg.includes("great")) {

      reply = "That's wonderful! I'm glad you're feeling happy.";

    }

    else if (msg.includes("stress") || msg.includes("anxious")) {

      reply = "You seem stressed. Deep breathing and relaxing music may help.";

    }

    else if (msg.includes("angry")) {

      reply = "You seem angry. Relaxing ambient music might help calm your mind.";

    }

    else if (msg.includes("music")) {

      reply = "Starting therapy music based on your emotional state.";

    }

    else if (msg.includes("help")) {

      reply = "You can ask me to analyze your mood or play relaxing therapy music.";

    }

    else if (currentEmotion) {

      switch (currentEmotion) {

        case "Sad":
          reply = "Your detected mood is sad. I recommend calming therapy music.";
          break;

        case "Happy":
          reply = "You seem happy today. Let's keep the positive energy flowing!";
          break;

        case "Angry":
          reply = "You appear stressed or angry. Relaxing music could help.";
          break;

        case "Fear":
          reply = "You seem anxious. Try slow breathing with calm music.";
          break;

        default:
          reply = "Your emotional state looks balanced. Would you like some focus music?";
      }

    }

    else {

      reply = "I understand. Would you like me to analyze your mood or play therapy music?";

    }

    addMessage("assistant", reply);

    speak(reply);

  };

  // Start / stop listening
  const startListening = () => {

    if (!recognitionRef.current) return;

    try {

      if (recognitionActive.current) {

        recognitionRef.current.stop();
        recognitionActive.current = false;
        setIsListening(false);
        return;

      }

      recognitionRef.current.start();

      recognitionActive.current = true;
      setIsListening(true);

    }

    catch (error) {

      console.warn("Speech recognition error:", error);

    }

  };

  // Send typed message
  const sendMessage = () => {

    if (!input.trim()) return;

    addMessage("user", input);

    generateReply(input);

    setInput("");

  };

  return (

    <div className="flex flex-col h-[450px] bg-black/40 border border-white/10 rounded-xl p-4 w-full max-w-xl">

      {/* Header */}

      <div className="flex items-center gap-2 mb-3 text-white font-bold">

        <Bot className="text-cyan-400" />

        SmartCare AI Assistant

      </div>

      {/* Chat Window */}

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2">

        {messages.map((msg, index) => (

          <div
            key={msg.id || index}
            className={`p-3 rounded-lg max-w-[80%] text-sm ${msg.role === "user"
              ? "bg-gray-800 self-end text-white"
              : "bg-cyan-900/40 border border-cyan-500/30 text-white self-start"
              }`}
          >

            <div className="text-xs opacity-50 mb-1">

              {msg.role === "user" ? "You" : "Assistant"}

            </div>

            {msg.text}

          </div>

        ))}

      </div>

      {/* Input */}

      <div className="flex gap-2 mt-4">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask SmartCare assistant..."
          className="flex-1 bg-gray-900 border border-white/10 rounded-lg p-2 text-white text-sm outline-none"
        />

        <button
          onClick={sendMessage}
          className="bg-cyan-400 text-black px-4 rounded-lg"
        >
          <Send size={18} />
        </button>

      </div>

      {/* Voice Button */}

      <div className="flex items-center justify-center mt-4">

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={startListening}
          className={`p-5 rounded-full ${isListening
            ? "bg-red-500 text-white"
            : "bg-cyan-400 text-black"
            }`}
        >

          {isListening ? <MicOff size={24} /> : <Mic size={24} />}

        </motion.button>

      </div>

      {/* Listening Animation */}

      {isListening && (

        <motion.div
          className="w-full h-2 bg-cyan-400 mt-3 rounded-full"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />

      )}

    </div>

  );

}