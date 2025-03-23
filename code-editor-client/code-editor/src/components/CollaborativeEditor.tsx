"use client";

import * as Y from "yjs";
import { yCollab } from "y-codemirror.next";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { useCallback, useEffect, useState, useRef } from "react";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import styles from "./CollaborativeEditor.module.css";
import { Avatars } from "@/components/Avatars";
import { Toolbar } from "@/components/Toolbar";
import ReactMarkdown from "react-markdown";

// Chatbot component with API integration
function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your coding assistant. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const fetchAnswerFromAPI = async (question) => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8000/technical-qna", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data.answer;
    } catch (error) {
      console.error("Error fetching from API:", error);
      return {
        error: true,
        message:
          "Sorry, I couldn't connect to the API. Please try again later.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);

    // Add loading message
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Thinking...", isLoading: true },
    ]);

    // Fetch response from API
    const apiResponse = await fetchAnswerFromAPI(inputValue);

    // Remove loading message and add actual response
    setMessages((prev) => {
      const filteredMessages = prev.filter((msg) => !msg.isLoading);
      return [
        ...filteredMessages,
        {
          sender: "bot",
          text: apiResponse.error ? apiResponse.message : apiResponse,
        },
      ];
    });

    setInputValue("");
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className={styles.chatbot}>
      <div className={styles.header}>Code Assistant</div>
      <div className={styles.messages} ref={messagesContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={styles.messageContainer}>
            <div
              className={
                message.sender === "user"
                  ? styles.userMessage
                  : styles.botMessage
              }
            >
              {message.isLoading ? (
                <div className={styles.loadingIndicator}>
                  <span>•</span>
                  <span>•</span>
                  <span>•</span>
                </div>
              ) : typeof message.text === "object" ? (
                <pre className={styles.jsonResponse}>
                  {JSON.stringify(message.text, null, 2)}
                </pre>
              ) : (
                <div className={styles.markdown}>
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.input}>
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputValue.trim()}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                fill={isLoading || !inputValue.trim() ? "#ccc" : "#4a4a4a"}
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

// Collaborative code editor with undo/redo, live cursors, live avatars, and chatbot
export function CollaborativeEditor() {
  const room = useRoom();
  const provider = getYjsProviderForRoom(room);
  const [element, setElement] = useState<HTMLElement>();
  const [yUndoManager, setYUndoManager] = useState<Y.UndoManager>();
  const [showChatbot, setShowChatbot] = useState(true);

  // Get user info from Liveblocks authentication endpoint
  const userInfo = useSelf((me) => me.info);

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    setElement(node);
  }, []);

  // Set up Liveblocks Yjs provider and attach CodeMirror editor
  useEffect(() => {
    if (!element || !room || !userInfo) {
      return;
    }

    // Create Yjs provider and document
    const ydoc = provider.getYDoc();
    const ytext = ydoc.getText("codemirror");
    const undoManager = new Y.UndoManager(ytext);
    setYUndoManager(undoManager);

    // Attach user info to Yjs
    provider.awareness.setLocalStateField("user", {
      name: userInfo.name,
      color: userInfo.color,
      colorLight: userInfo.color + "80", // 6-digit hex code at 50% opacity
    });

    // Set up CodeMirror and extensions
    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,
        javascript(),
        yCollab(ytext, provider.awareness, { undoManager }),
      ],
    });

    // Attach CodeMirror to element
    const view = new EditorView({
      state,
      parent: element,
    });

    return () => {
      view?.destroy();
    };
  }, [element, room, userInfo]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
        <div className={styles.editorHeader}>
          <div>
            {yUndoManager ? <Toolbar yUndoManager={yUndoManager} /> : null}
          </div>
          <div className={styles.headerRight}>
            <button
              className={styles.toggleChatButton}
              onClick={() => setShowChatbot((prev) => !prev)}
            >
              {showChatbot ? "Hide Assistant" : "Show Assistant"}
            </button>
            <Avatars />
          </div>
        </div>
        <div className={styles.splitView}>
          <div
            className={`${styles.editorContainer} ${showChatbot ? styles.withChatbot : ""}`}
            ref={ref}
          ></div>
          {showChatbot && (
            <div className={styles.chatbotWrapper}>
              <Chatbot />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
