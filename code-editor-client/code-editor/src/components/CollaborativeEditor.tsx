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

// Chatbot component
function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your coding assistant. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate bot response (replace with actual API calls later)
    setTimeout(() => {
      const botMessage = {
        sender: "bot",
        text: "I received your message. This is a placeholder response. In a real implementation, you would integrate with an actual chatbot API here.",
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);

    setInputValue("");
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Using setTimeout to ensure DOM has updated before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
              {message.text}
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
            placeholder="Type a message..."
          />
          <button type="submit">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#4a4a4a" />
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
