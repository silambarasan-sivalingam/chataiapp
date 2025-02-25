"use client";
import { useState, KeyboardEvent } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = messages.map((msg) => ({
        inputs: { question: msg.content },
        outputs: { answer: "" }
      }));

      const requestBody = {
        question: input,
        chat_history: chatHistory
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages([...newMessages, { role: "assistant", content: data.response }]);
      } else {
        console.error("AI Error:", data.error);
        setMessages([...newMessages, { role: "assistant", content: "Error: " + data.error }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([...newMessages, { role: "assistant", content: "Failed to connect to server" }]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Let Shift+Enter create a new line
        return;
      }
      // Prevent the default enter behavior and send message
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI for Terraform Code Generation </h1>

      <div className="border p-4 rounded-lg h-96 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 p-2 rounded ${msg.role === "user" ? "bg-blue-200" : "bg-gray-200"}`}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div className="flex">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border p-2 rounded resize-none"
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          rows={3}
          style={{ minHeight: '60px' }}
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded h-fit"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
      <div className="text-sm text-gray-500 mt-2">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
