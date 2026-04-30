import "../styles/LegalPage.css";

function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <h1>FitnessFR Privacy Policy</h1>
        <p className="legal-updated">Last Updated: 2026</p>

        <p>
          FitnessFR values your privacy and is committed to protecting your
          personal information. This Privacy Policy explains what information we
          collect, how we use it, and how we protect it when you use the
          FitnessFR platform.
        </p>

        <h2>1. Information We Collect</h2>
        <p>We may collect the following information when you use FitnessFR:</p>

        <h3>Personal Information</h3>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Username</li>
          <li>Password, encrypted</li>
          <li>Profile details such as age, fitness goals, activity preferences, or coach preferences</li>
        </ul>

        <h3>Health and Fitness Data</h3>
        <ul>
          <li>Workout logs</li>
          <li>Nutrition and meal tracking information</li>
          <li>Wellness metrics such as weight, hydration, sleep, and activity tracking</li>
        </ul>

        <h3>Device and Usage Information</h3>
        <ul>
          <li>IP address</li>
          <li>Browser type</li>
          <li>Device type</li>
          <li>Operating system</li>
          <li>Usage analytics such as pages visited, clicks, and session activity</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>Provide personalized fitness recommendations</li>
          <li>Allow coaches and clients to communicate through the platform</li>
          <li>Save workout, meal, and wellness tracking data</li>
          <li>Improve the functionality and performance of the platform</li>
          <li>Send account updates, notifications, and support responses</li>
          <li>Maintain platform security and prevent fraud</li>
        </ul>

        <h2>3. Sharing of Information</h2>
        <p>FitnessFR does not sell personal information.</p>

        <ul>
          <li>Service providers that help operate the platform</li>
          <li>Coaches or trainers connected to your account</li>
          <li>Legal authorities if required by law</li>
          <li>Analytics or hosting providers that support application performance</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>
          We take reasonable precautions to protect user data from unauthorized
          access, misuse, or disclosure.
        </p>

        <ul>
          <li>Secure authentication</li>
          <li>Encrypted password storage</li>
          <li>Protected database access</li>
          <li>Regular monitoring of platform security</li>
        </ul>

        <h2>5. User Rights</h2>
        <ul>
          <li>Request access to your stored information</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your account or data</li>
          <li>Contact support with privacy concerns</li>
        </ul>

        <h2>6. Cookies and Tracking</h2>
        <ul>
          <li>Keep users logged in</li>
          <li>Remember user preferences</li>
          <li>Improve site performance and analytics</li>
        </ul>

        <h2>7. Third-Party Services</h2>
        <ul>
          <li>Google Authentication</li>
          <li>Payment processors</li>
          <li>Analytics platforms</li>
        </ul>

        <p>
          These services may collect data according to their own privacy
          policies.
        </p>

        <h2>8. Contact Us</h2>
        <p>
          Email: <a href="mailto:support@fitnessfr.com">support@fitnessfr.com</a>
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;