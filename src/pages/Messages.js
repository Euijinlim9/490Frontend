import React, { useState } from "react";
import "../styles/Messages.css";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState("");

  const handleStartNewChat = () => {
    const coachJoeId = 1;

    const existingConversation = conversations.find(
      (conversation) => conversation.id === coachJoeId
    );

    if (existingConversation) {
      setSelectedConversationId(existingConversation.id);
      return;
    }

    const newConversation = {
      id: coachJoeId,
      name: "Coach Joe",
      preview: "Start a new conversation",
    };

    setConversations((prev) => [...prev, newConversation]);
    setMessages((prev) => ({
      ...prev,
      [coachJoeId]: [],
    }));
    setSelectedConversationId(coachJoeId);
  };

  const handleSend = () => {
    const trimmedMessage = inputValue.trim();

    if (!trimmedMessage || !selectedConversationId) return;

    const newMessage = {
      id: Date.now(),
      text: trimmedMessage,
      sender: "me",
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConversationId]: [
        ...(prev[selectedConversationId] || []),
        newMessage,
      ],
    }));

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === selectedConversationId
          ? { ...conversation, preview: trimmedMessage }
          : conversation
      )
    );

    setInputValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId
  );

  const currentMessages = selectedConversationId
    ? messages[selectedConversationId] || []
    : [];

  return (
    <div className="messages-page">
      <aside className="messages-sidebar">
        <div className="sidebar-top">
          <h2 className="messages-sidebar-title">Messages</h2>
          <button className="new-chat-btn" onClick={handleStartNewChat}>
            + New Chat
          </button>
        </div>

        <div className="conversation-list">
          {conversations.length === 0 ? (
            <div className="no-conversations">
              No conversations yet.
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`conversation-item ${
                  selectedConversationId === conversation.id ? "active" : ""
                }`}
                onClick={() => setSelectedConversationId(conversation.id)}
              >
                <div className="conversation-avatar"></div>

                <div className="conversation-text">
                  <div className="conversation-name">{conversation.name}</div>
                  <div className="conversation-preview">
                    {conversation.preview}
                  </div>
                </div>
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
                <div className="chat-header-status">
                  Start a conversation
                </div>
              </div>
            </div>

            <div className="chat-body">
              {currentMessages.length === 0 ? (
                <div className="empty-chat">
                  No messages yet. Send your first message to{" "}
                  {selectedConversation.name}.
                </div>
              ) : (
                currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`message-row ${
                      message.sender === "me" ? "right" : "left"
                    }`}
                  >
                    <div
                      className={`message-bubble ${
                        message.sender === "me" ? "right-bubble" : "left-bubble"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="chat-input-bar">
              <input
                type="text"
                className="chat-input"
                placeholder={`Message ${selectedConversation.name}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
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