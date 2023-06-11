import React, { useRef } from "react";
import classes from "./Login.module.css";
import Card from "./UI/Card";

const Login = (props) => {
  const usernameInputRef = useRef();
  const passwordInputRef = useRef();

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_IP}/login`, {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          username: usernameInputRef.current.value,
          password: passwordInputRef.current.value,
        }),
      });
      const data = await response.json();

      if (!data.token) {
        throw new Error(data.status);
      }

      const loginDate = new Date();
      props.onLogin(
        usernameInputRef.current.value,
        loginDate.toLocaleString("en-US")
      );
      localStorage.setItem("isLoggedIn", data.token);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className={classes.body}>
      <Card>
        <form className={classes.form} onSubmit={submitHandler}>
          <div className={classes["form-field"]}>
            <label className={classes.label} htmlFor="username">
              Username:{" "}
              <input
                required
                ref={usernameInputRef}
                className={classes.input}
                type="text"
                id="username"
                name="username"
                placeholder="Enter Username"
              />
            </label>
          </div>
          <div className={classes["form-field"]}>
            <label className={classes.label} htmlFor="password">
              Password:{" "}
              <input
                required
                ref={passwordInputRef}
                className={classes.input}
                type="password"
                id="password"
                name="password"
                placeholder="Enter Password"
              />
            </label>
          </div>
          <button
            type="submit"
            style={{ marginTop: "30px" }}
            className={classes.btn}
          >
            Log in
          </button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
