import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { PaperClipIcon, FaceSmileIcon, PaperAirplaneIcon, ArrowLeftStartOnRectangleIcon  } from '@heroicons/react/24/outline';

const socket = io("https://whatsapp-clone-qi4h.onrender.com");

function App() {
  const [chats, setChats] = useState([]);
  const [activeWaId, setActiveWaId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch conversation list on load
  useEffect(() => {
    axios.get("https://whatsapp-clone-qi4h.onrender.com/conversations")
      .then(res => setChats(res.data));
  }, []);

  // Fetch messages for selected chat
  useEffect(() => {
    if (activeWaId)
      axios.get("https://whatsapp-clone-qi4h.onrender.com/messages/" + activeWaId)
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
    await axios.post("https://whatsapp-clone-qi4h.onrender.com/send", {
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
              className={`px-4 py-3 cursor-pointer transition ${chat.waId === activeWaId ? "bg-green-100" : ""} hover:bg-gray-200`}
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
        <header className="px-3 py-2 flex items-center justify-between border-b border-gray-300 bg-green-50">
        {/* LEFT: Chat name & Mobile menu */}
          <div className="flex items-center min-w-0">
            {/* Hamburger (Mobile only) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center md:hidden mr-3"
              aria-label="Open sidebar"
            >
              <Bars3Icon className="w-6 h-6 text-gray-700" />
            </button>

            {/* Chat Name */}
            <b className="truncate text-base md:text-lg font-medium">
              {chats.find(c => c.waId === activeWaId)?.name || <span>
                <ArrowLeftStartOnRectangleIcon className="inline h-6 w-6 text-gray-500" /><span> Select a chat </span></span>
              }
            </b>
          </div>

          {/* RIGHT: Action Icons */}
          <div className="flex items-center gap-2">
            {/* Voice Call Icon */}
            <button
              title="Voice Call"
              className="p-2 hover:bg-green-100 rounded-full transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-7 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6.6 10.8c1.3 2.5 3.1 4.3 5.6 5.6l1.9-1.9a1 1 0 0 1 1-.25c1.1.36 2.3.55 3.5.55.55 0 1 .45 1 1v3.5c0 .55-.45 1-1 1C9.94 20.3 3.7 14.06 3.7 6.5 3.7 5.95 4.15 5.5 4.7 5.5H8.2c.55 0 1 .45 1 1 0 1.2.19 2.4.55 3.5a1 1 0 0 1-.25 1l-1.9 1.8z"/>
              </svg>
            </button>

            {/* Video Call Icon */}
            <button
              title="Video Call"
              className="p-2 hover:bg-green-100 rounded-full transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-7 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17 10.5V7c0-1.1-.9-2-2-2H5C3.9 5 3 5.9 3 7v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-3.5l4 4v-11l-4 4z"/>
              </svg>
            </button>

            {/* More Options (three dots) */}
            <button
              title="Menu"
              className="p-2 hover:bg-green-100 rounded-full transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </div>
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
                <div className="flex justify-between items-center text-[11px] text-gray-500 mt-1 gap-2">
                <span>{new Date(msg.timestamp * 1000).toLocaleString([], { hour: "2-digit", minute: "2-digit" })}</span>
                
                {/* Only show status if from 'you' */}
                {msg.from === "you" && (
                  <span className="ml-2 flex items-center gap-1">
                    {msg.status === "sent" && <span>✓</span>}
                    {msg.status === "delivered" && <span className="font-bold">✓✓</span>}
                    {msg.status === "read" && <span className="font-extrabold text-blue-600">✓✓</span>}
                  </span>
                )}
              </div>
              </span>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <footer className="p-2 sm:p-2 border-t border-gray-300 bg-white flex items-center gap-2">
          {/* Emoji Icon */}
          <button className="p-2 hover:bg-gray-200 rounded-full">
            <FaceSmileIcon className="w-6 h-6 text-gray-500" />
          </button>
          {/* Attachment Icon */}
          <button className="p-2 hover:bg-gray-200 rounded-full">
            <PaperClipIcon className="w-6 h-6 text-gray-500" />
          </button>
          <input
            value={input}
            placeholder="Type a message"
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            className="flex-1 min-w-0 p-2 rounded-2xl bg-slate-100 border border-gray-300 focus:outline-none text-sm md:text-base"
            autoComplete="off"
          />
          <button
            onClick={sendMessage}
            className="px-3 py-3 xs:px-5 bg-[#25D366] text-white rounded-full font-medium text-sm md:text-base"
          >
            <PaperAirplaneIcon className="h-6 w-6 text-gray-600" />
          </button>
        </footer>
      </main>
    </div>
  );

}

export default App;
