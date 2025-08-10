import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const socket = io("http://localhost:5000");

function App() {
  const [chats, setChats] = useState([]);
  const [activeWaId, setActiveWaId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
   const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch conversation list on load
  useEffect(() => {
    axios.get("http://localhost:5000/conversations")
      .then(res => setChats(res.data));
  }, []);

  // Fetch messages for selected chat
  useEffect(() => {
    if (activeWaId)
      axios.get("http://localhost:5000/messages/" + activeWaId)
        .then(res => setMessages(res.data));
  }, [activeWaId]);

  // Listen for new messages in real time
  useEffect(() => {
    socket.on("new_message", (msg) => {
      if (msg.waId === activeWaId) {
        setMessages(m => [...m, msg]);
      }
    });
    return () => socket.off("new_message");
  }, [activeWaId]);

  // Send new message
  const sendMessage = async () => {
    if (!input) return;
    await axios.post("http://localhost:5000/send", {
      waId: activeWaId,
      conversationId: activeWaId,
      body: input
    });
    setInput("");
  };

  return (
    <div className="flex h-screen border border-gray-200 max-h-screen">
      {/* Sidebar for desktop, SlideOver for mobile */}
      {/* Overlay for mobile when open */}
      <div
        className={`fixed inset-0 z-20 bg-black/30 md:hidden transition-opacity duration-200 ${sidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`
          fixed z-30 inset-y-0 left-0 w-[80vw] max-w-xs bg-gray-100 border-r border-gray-200 transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200
          md:static md:translate-x-0 md:w-[260px] md:block
        `}
        style={{ top: 0, bottom: 0 }}
      >
        <div className="flex items-center justify-between md:hidden p-4 border-b border-gray-200">
          <b className="text-lg">Chats</b>
          <button onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto h-full">
          {chats.map(chat => (
            <div
              key={chat.waId}
              className={`px-4 py-3 cursor-pointer transition ${chat.waId === activeWaId ? "bg-green-50" : ""} hover:bg-gray-200`}
              onClick={() => {
                setActiveWaId(chat.waId);
                setSidebarOpen(false);
              }}
            >
              <strong className="block text-base md:text-sm">{chat.name}</strong>
              <small className="block text-xs text-gray-500 truncate">{chat.waId}</small>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex flex-col flex-1 bg-[#ece5dd]">
        {/* Header with sidebar toggle on mobile */}
        <header className="p-3 flex items-center border-b border-gray-300 bg-white">
          {/* Hamburger Menu for mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center md:hidden mr-2"
            aria-label="Open sidebar"
          >
            <Bars3Icon className="w-7 h-7" />
          </button>
          <b className="truncate text-base md:text-lg">{chats.find(c => c.waId === activeWaId)?.name || "Select a chat"}</b>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-2 xs:p-3 sm:p-4 md:p-5 bg-[#ece5dd] flex flex-col">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`my-1 flex ${msg.from === "you" ? "justify-end" : "justify-start"}`}
            >
              <span
                className={`
                  inline-block rounded-lg px-3 py-2
                  text-sm sm:text-base max-w-[85vw] sm:max-w-[70%]
                  text-gray-900
                  ${msg.from === "you" ? "bg-[#dcf8c6]" : "bg-white"}
                  break-words
                `}
              >
                {msg.body}
                <div className="text-[11px] text-gray-500 mt-1 whitespace-nowrap">
                  {new Date(msg.timestamp * 1000).toLocaleString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </span>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <footer className="p-2 sm:p-3 border-t border-gray-300 bg-white flex items-center gap-2">
          <input
            value={input}
            placeholder="Type a message"
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            className="flex-1 min-w-0 p-2 rounded-lg border border-gray-300 focus:outline-none text-sm md:text-base"
            autoComplete="off"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 xs:px-5 bg-[#25D366] text-white rounded-lg font-medium text-sm md:text-base"
          >
            Send
          </button>
        </footer>
      </main>
    </div>
  );

}

export default App;
