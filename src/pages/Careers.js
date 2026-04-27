import "../styles/LegalPage.css";

function Careers() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <h1>Careers</h1>

        <p>
          FitnessFR is focused on building tools that make fitness tracking,
          nutrition planning, and coaching more accessible.
        </p>

        <h2>Future Opportunities</h2>
        <p>
          As the platform grows, we may offer opportunities in software
          development, design, coaching support, marketing, and customer service.
        </p>

        <h2>Contact</h2>
        <p>
          Interested in working with us? Email{" "}
          <a href="mailto:support@fitnessfr.com">support@fitnessfr.com</a>.
        </p>
      </div>
    </div>
  );
}

export default Careers;