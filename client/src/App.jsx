import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [msg, setMsg] = useState("Loading...");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/health")
      .then((res) => setMsg(res.data.message))
      .catch(() => setMsg("Backend not reachable"));
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>CSE470 Doctor-Patient System</h1>
      <p>Backend says: {msg}</p>
    </div>
  );
}
