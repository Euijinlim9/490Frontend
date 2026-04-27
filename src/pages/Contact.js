import "../styles/LegalPage.css";

function Contact() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <h1>Contact</h1>

        <p>
          Have questions about FitnessFR? Contact our support team.
        </p>

        <h2>Email</h2>
        <p>
          <a href="mailto:support@fitnessfr.com">support@fitnessfr.com</a>
        </p>

        <h2>Social Media</h2>
        <p>Instagram: @fitnessfr</p>

        <h2>Support Hours</h2>
        <p>Monday – Friday</p>
      </div>
    </div>
  );
}

export default Contact;