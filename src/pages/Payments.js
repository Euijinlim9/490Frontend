import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Payments.css";

function Payments() {
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [saveCard, setSaveCard] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    billingAddress: "",
    zipCode: "",
  });

  const getCardNetwork = (number) => {
    const digits = number.replace(/\s/g, "");
    if (/^4/.test(digits)) return "Visa";
    if (/^5[1-5]/.test(digits)) return "Mastercard";
    if (/^3[47]/.test(digits)) return "Amex";
    if (/^(6011|65)/.test(digits)) return "Discover";
    return "Unknown";
  };

  const handleSelect = (card) => {
    setSelectedCard(card.id);
    setForm((prev) => ({
      ...prev,
      name: card.name,
      cardNumber: card.cardNumber,
      expiry: card.expiry,
      cvv: "",
      billingAddress: card.billingAddress,
      zipCode: card.zipCode,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 16);
      const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
      setForm((prev) => ({ ...prev, cardNumber: formatted }));
      return;
    }

    if (name === "expiry") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
      setForm((prev) => ({ ...prev, expiry: formatted }));
      return;
    }

    if (name === "cvv") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      setForm((prev) => ({ ...prev, cvv: digits }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteCard = (id, e) => {
    e.stopPropagation();
    setSavedCards((prev) => prev.filter((c) => c.id !== id));
    if (selectedCard === id) {
      setSelectedCard(null);
      setForm({ name: "", cardNumber: "", expiry: "", cvv: "", amount: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.cardNumber || !form.expiry || !form.cvv || !form.billingAddress || !form.zipCode) return;

    if (saveCard) {
      const alreadySaved = savedCards.some((c) => c.cardNumber === form.cardNumber);
      if (!alreadySaved) {
        setSavedCards((prev) => [
          ...prev,
          {
            id: Date.now(),
            name: form.name,
            cardNumber: form.cardNumber,
            expiry: form.expiry,
            billingAddress: form.billingAddress,
            zipCode: form.zipCode,
          },
        ]);
      }
    }

    setSuccessMsg("Payment processed successfully!");
    setForm({ name: "", cardNumber: "", expiry: "", cvv: "", billingAddress: "", zipCode: "" });
    setSelectedCard(null);
    setSaveCard(false);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const maskCard = (number) => {
    const digits = number.replace(/\s/g, "");
    return `•••• •••• •••• ${digits.slice(-4)}`;
  };

  return (
    <div className="payments-wrapper">
      <div className="payments-topbar">
        <Link to="/payment-history" className="history-btn">Payment History</Link>
      </div>

      <div className="payments-page">

      <div className="saved-cards-panel">
        <h2 className="panel-title">Saved Cards</h2>
        {savedCards.length === 0 ? (
          <p className="no-cards">No saved cards yet.</p>
        ) : (
          <div className="cards-list">
            {savedCards.map((card) => (
              <div
                key={card.id}
                className={`saved-card ${selectedCard === card.id ? "selected-card" : ""}`}
                onClick={() => handleSelect(card)}
              >
                <div className="card-chip">▬</div>
                <div className="card-number">{maskCard(card.cardNumber)}</div>
                <div className="card-footer">
                  <span className="card-name">{card.name}</span>
                  <span className="card-expiry">Exp: {card.expiry}</span>
                </div>
                <div className="card-network">{getCardNetwork(card.cardNumber)}</div>
                <button className="card-delete-btn" onClick={(e) => handleDeleteCard(card.id, e)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="payment-form-panel">
        <h2 className="panel-title">Payment Details</h2>

        {successMsg && <div className="success-msg">{successMsg}</div>}

        <form className="payment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              name="name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Card Number</label>
            <input
              name="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={form.cardNumber}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                name="expiry"
                type="text"
                placeholder="MM/YY"
                value={form.expiry}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>CVV</label>
              <input
                name="cvv"
                type="password"
                placeholder="•••"
                value={form.cvv}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Billing Address</label>
            <input
              name="billingAddress"
              type="text"
              placeholder="123 Main St"
              value={form.billingAddress}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Zip Code</label>
            <input
              name="zipCode"
              type="text"
              placeholder="10001"
              value={form.zipCode}
              onChange={handleChange}
            />
          </div>

          <div className="save-card-row">
            <input
              id="saveCard"
              type="checkbox"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
            />
            <label htmlFor="saveCard">Save card for future payments</label>
          </div>

          <button type="submit" className="pay-btn">Pay Now</button>
        </form>
      </div>

    </div>
    </div>
  );
}

export default Payments;
