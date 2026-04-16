const API_BASE = "http://localhost:4000";

function authHeaders() {
  const token = localStorage.getItem("token"); // wherever you store your JWT
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchConversations() {
  const res = await fetch(`${API_BASE}/message/conversations`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch conversations");
  const data = await res.json();
  return data.conversations;
}

export async function fetchContacts() {
  const res = await fetch(`${API_BASE}/message/contacts`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch contacts");
  const data = await res.json();
  return data.contacts;
}

export async function fetchMessages(otherUserId) {
  const res = await fetch(`${API_BASE}/message/${otherUserId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch messages");
  const data = await res.json();
  return data.messages;
}

export async function sendMessage(toId, content) {
  const res = await fetch(`${API_BASE}/message`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ to_id: toId, message_content: content }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to send message");
  }
  const data = await res.json();
  return data.message;
}
