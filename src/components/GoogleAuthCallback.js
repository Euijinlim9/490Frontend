import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

function GoogleAuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  useEffect(() => {
    const handleCallback = async () => {
      // Grab the token from the URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token) {
        // Save the token to localStorage
        localStorage.setItem("token", token);

        // Fetch user data and set it in Context
        const res = await fetch(`http://localhost:4000/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
        // wipe the token from the browser address bar
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        // No token means something went wrong
        navigate("login");
      }
    };
    handleCallback();
  }, [navigate, setUser]);

  return <p>Loging you in ...</p>;
}

export default GoogleAuthCallback;
