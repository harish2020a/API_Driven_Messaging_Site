import React, { useEffect, useState } from "react";
import Form from "./components/Form";
import Login from "./components/Login";
import classes from "./App.module.css";
import Card from "./components/UI/Card";

function App() {
  const [username, setUsername] = useState("");
  const [loginDate, setLoginDate] = useState("");

  useEffect(() => {
    const logCheck = localStorage.getItem("isLoggedIn");
    if (logCheck) {
      setIsLoggedIn(true);
    }
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [TEMPLATES, setTEMPLATES] = useState([]);

  useEffect(() => {
    const getTemplate = async () => {
      const response = await fetch(`${import.meta.env.VITE_IP}/templates`);
      const data = await response.json();

      setTEMPLATES(data);
    };
    getTemplate();
  }, []);

  const logoutHandler = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  const loginHandler = (username, loginDate) => {
    setUsername(username);
    setLoginDate(loginDate);
    setIsLoggedIn(true);
  };

  return (
    <React.Fragment>
      {isLoggedIn && (
        <Form
          templates={TEMPLATES}
          onLogout={logoutHandler}
          setTEMPLATES={setTEMPLATES}
          info={{ username, loginDate }}
        />
      )}
      {!isLoggedIn && <Login onLogin={loginHandler} />}
    </React.Fragment>
  );
}

export default App;
