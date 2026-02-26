"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import rustyResponses from "@/data/rustyResponses.json";

type Message = {
  id: number;
  text: string;
  sender: "user" | "assistant";
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [rustyLeft, setRustyLeft] = useState(false);
  const [rustyLeaving, setRustyLeaving] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Only reply if Rusty hasn't left
    if (!rustyLeft) {
      // Delay before showing typing indicator (Rusty "reading")
      setTimeout(() => {
        setIsTyping(true);
      }, 800);

      // Fetch AI response from API
      setTimeout(async () => {
        try {
          const response = await fetch("https://naas.isalman.dev/no");
          const data = await response.json();

          const aiResponse: Message = {
            id: Date.now() + 1,
            text: data.reason || "reply",
            sender: "assistant",
          };
          setMessages((prev) => [...prev, aiResponse]);
        } catch (error) {
          console.error("Error fetching response:", error);
          const aiResponse: Message = {
            id: Date.now() + 1,
            text: "Sorry, I couldn't respond right now.",
            sender: "assistant",
          };
          setMessages((prev) => [...prev, aiResponse]);
        } finally {
          setIsTyping(false);
        }
      }, 3800);
    }
  };

  const handleRustyClick = () => {
    if (rustyLeaving || rustyLeft) return; // Don't respond if already leaving or left

    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    if (newClickCount >= 10) {
      // Final message before leaving
      const finalMessage: Message = {
        id: Date.now(),
        text: "THAT'S IT! I'M DONE!",
        sender: "assistant",
      };
      setMessages((prev) => [...prev, finalMessage]);

      // Start leaving animation
      setRustyLeaving(true);

      // After animation completes, mark as left
      setTimeout(() => {
        setRustyLeft(true);
      }, 1000); // Match animation duration
    } else if (newClickCount === 9) {
      // Second to last click - warning message
      const warningMessage: Message = {
        id: Date.now(),
        text: "I SWEAR if you click me ONE MORE TIME!",
        sender: "assistant",
      };
      setMessages((prev) => [...prev, warningMessage]);
    } else {
      // Generate random number to select a response
      const randomIndex = Math.floor(Math.random() * rustyResponses.responses.length);
      const randomResponse = rustyResponses.responses[randomIndex];

      const rustyMessage: Message = {
        id: Date.now(),
        text: randomResponse.text,
        sender: "assistant",
      };

      setMessages((prev) => [...prev, rustyMessage]);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>No Help Desk</h1>
        </div>
      </header>

      {/* Main Content Area with Chat and Rusty */}
      <main className={styles.mainContent}>
        {/* Chat Messages - Centered */}
        <div className={styles.chatArea}>
          <div className={styles.messages}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.messageRow} ${message.sender === "assistant" ? styles.aiMessageRow : ""
                  }`}
              >
                <div className={styles.message}>
                  <div
                    className={`${styles.messageContent} ${message.sender === "assistant" ? styles.aiMessage : ""
                      }`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={`${styles.messageRow} ${styles.aiMessageRow}`}>
                <div className={styles.message}>
                  <div className={`${styles.messageContent} ${styles.aiMessage}`}>
                    <div className={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rusty Character - Positioned Right */}
        {!rustyLeft && (
          <div
            className={`${styles.rustyContainer} ${rustyLeaving ? styles.rustyLeaving : ''}`}
            onClick={handleRustyClick}
          >
            <Image
              src="/rustyPlaceholder.png"
              alt="Rusty the AI assistant"
              width={500}
              height={500}
              className={styles.rustyImage}
              priority
              unoptimized
            />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className={styles.inputArea}>
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything"
            className={styles.input}
          />
          <button type="submit" className={styles.sendButton}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 11L12 6L17 11M12 18V7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
