import React, { useState, useEffect, useContext, useRef } from "react";
import "../styles/Messages.css";
import { AuthContext } from "../context/AuthContext";
import {
  fetchConversations,
  fetchContacts,
  fetchMessages,
  sendMessage,
} from "../api/messages";
import { io } from "socket.io-client";

function formatMessageTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();

  const sameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const wasYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (sameDay) return timeStr;
  if (wasYesterday) return `Yesterday ${timeStr}`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState({}); // keyed by otherUserId
  const [inputValue, setInputValue] = useState("");
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // { [otherUserId]: true/false }

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const selectedConversationIdRef = useRef(selectedConversationId);
  const messagesEndRef = useRef(null);

  const { user, loading } = useContext(AuthContext);
  const currentUserId = user?.user_id;

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Load conversations on mount
  useEffect(() => {
    fetchConversations()
      .then(setConversations)
      .catch((err) => console.error("Failed to load conversations:", err));
  }, []);

  // Load messages when a conversation is selected (only if not already loaded)
  useEffect(() => {
    if (!selectedConversationId) return;

    setMessages((prev) => {
      if (prev[selectedConversationId]) return prev;

      fetchMessages(selectedConversationId)
        .then((msgs) => {
          setMessages((p) => ({ ...p, [selectedConversationId]: msgs }));
        })
        .catch((err) => console.error("Failed to load messages:", err));

      return prev;
    });
  }, [selectedConversationId]);

  // Keep ref in sync with selected conversation (for use in socket handlers)
  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  // Auto-scroll to bottom when messages change or conversation switches
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConversationId]);

  // Socket connection — real-time message delivery + typing indicators
  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:4000", {
      auth: { token: localStorage.getItem("token") },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("new_message", (message) => {
      const otherUserId =
        message.from_id === user.user_id ? message.to_id : message.from_id;

      // Dedupe
      setMessages((prev) => {
        const existing = prev[otherUserId] || [];
        if (existing.some((m) => m.message_id === message.message_id)) {
          return prev;
        }
        return {
          ...prev,
          [otherUserId]: [...existing, message],
        };
      });

      setConversations((prev) => {
        const exists = prev.find((c) => c.id === otherUserId);

        const isIncoming = message.from_id !== user.user_id;
        const isActiveConversation =
          otherUserId === selectedConversationIdRef.current;
        const shouldIncrementUnread = isIncoming && !isActiveConversation;

        if (exists) {
          return prev.map((c) =>
            c.id === otherUserId
              ? {
                  ...c,
                  preview: message.message_content,
                  lastMessageAt: message.created_at,
                  unreadCount: shouldIncrementUnread
                    ? (c.unreadCount || 0) + 1
                    : c.unreadCount || 0,
                }
              : c
          );
        }
        return prev;
      });
    });

    socket.on("user_typing", ({ from_id, typing }) => {
      setTypingUsers((prev) => ({ ...prev, [from_id]: typing }));
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const handleStartNewChat = async () => {
    if (!showChatOptions) {
      setLoadingContacts(true);
      try {
        const data = await fetchContacts();
        setContacts(data);
      } catch (err) {
        console.error("Failed to load contacts:", err);
      } finally {
        setLoadingContacts(false);
      }
    }
    setShowChatOptions((prev) => !prev);
  };

  const handleSelectChat = (person) => {
    const existing = conversations.find((c) => c.id === person.user_id);
    if (existing) {
      setSelectedConversationId(existing.id);
      setShowChatOptions(false);
      return;
    }

    const newConversation = {
      id: person.user_id,
      name: `${person.first_name} ${person.last_name}`,
      profilePic: person.profile_pic,
      preview: "Start a new conversation",
      lastMessageAt: null,
    };

    setConversations((prev) => [newConversation, ...prev]);
    setMessages((prev) => ({ ...prev, [person.user_id]: [] }));
    setSelectedConversationId(person.user_id);
    setShowChatOptions(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    if (!selectedConversationId || !socketRef.current) return;

    if (!isTypingRef.current) {
      socketRef.current.emit("typing_start", { to_id: selectedConversationId });
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && isTypingRef.current) {
        socketRef.current.emit("typing_stop", {
          to_id: selectedConversationId,
        });
        isTypingRef.current = false;
      }
    }, 2000);
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !selectedConversationId) return;

    if (socketRef.current && isTypingRef.current) {
      socketRef.current.emit("typing_stop", { to_id: selectedConversationId });
      isTypingRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    try {
      const savedMessage = await sendMessage(selectedConversationId, trimmed);

      setMessages((prev) => {
        const existing = prev[selectedConversationId] || [];
        if (existing.some((m) => m.message_id === savedMessage.message_id)) {
          return prev;
        }
        return {
          ...prev,
          [selectedConversationId]: [...existing, savedMessage],
        };
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversationId
            ? { ...c, preview: trimmed, lastMessageAt: savedMessage.created_at }
            : c
        )
      );

      setInputValue("");
    } catch (err) {
      console.error("Failed to send:", err);
      alert(err.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );
  const currentMessages = selectedConversationId
    ? messages[selectedConversationId] || []
    : [];

  if (loading) {
    return <div className="messages-page">Loading...</div>;
  }
  if (!user) {
    return <div className="messages-page">Please log in to view messages.</div>;
  }

  return (
    <div className="messages-page">
      <aside className="messages-sidebar">
        <div className="sidebar-top">
          <h2 className="messages-sidebar-title">Messages</h2>
          <div className="new-chat-wrapper">
            <button className="new-chat-btn" onClick={handleStartNewChat}>
              + New Chat
            </button>

            {showChatOptions && (
              <div className="chat-options-menu">
                {loadingContacts ? (
                  <div className="chat-option-btn">Loading...</div>
                ) : contacts.length === 0 ? (
                  <div className="chat-option-btn">
                    No one available to message yet.
                  </div>
                ) : (
                  contacts.map((person) => (
                    <button
                      key={person.user_id}
                      className="chat-option-btn"
                      onClick={() => handleSelectChat(person)}
                    >
                      {person.first_name} {person.last_name}
                      <span style={{ opacity: 0.6, marginLeft: 8 }}>
                        ({person.role})
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="conversation-list">
          {conversations.length === 0 ? (
            <div className="no-conversations">No conversations yet.</div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`conversation-item ${
                  selectedConversationId === conversation.id ? "active" : ""
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <div className="conversation-avatar">
                  {conversation.profilePic && (
                    <img src={conversation.profilePic} alt="" />
                  )}
                </div>
                <div className="conversation-text">
                  <div className="conversation-name">{conversation.name}</div>
                  <div className="conversation-preview">
                    {conversation.preview}
                  </div>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="unread-badge">
                    {conversation.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      <main className="messages-chat">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-header-avatar"></div>
              <div className="chat-header-text">
                <div className="chat-header-name">
                  {selectedConversation.name}
                </div>
                <div className="chat-header-status">Online</div>
              </div>
            </div>

            <div className="chat-body">
              {currentMessages.length === 0 ? (
                <div className="empty-chat">
                  No messages yet. Send your first message to{" "}
                  {selectedConversation.name}.
                </div>
              ) : (
                currentMessages.map((message) => {
                  const isMe = message.from_id === currentUserId;
                  return (
                    <div
                      key={message.message_id}
                      className={`message-row ${isMe ? "right" : "left"}`}
                    >
                      <div
                        className={`message-bubble ${
                          isMe ? "right-bubble" : "left-bubble"
                        }`}
                      >
                        {message.message_content}
                      </div>
                      <div className="message-timestamp">
                        {formatMessageTime(message.created_at)}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {typingUsers[selectedConversationId] && (
              <div className="typing-indicator">
                {selectedConversation.name} is typing...
              </div>
            )}

            <div className="chat-input-bar">
              <input
                type="text"
                className="chat-input"
                placeholder={`Message ${selectedConversation.name}...`}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                maxLength={5000}
              />
              <button className="send-btn" onClick={handleSend}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="no-conversation-selected">
            Click <strong>New Chat</strong> to start messaging.
          </div>
        )}
      </main>
    </div>
  );
}
 export default Messages;