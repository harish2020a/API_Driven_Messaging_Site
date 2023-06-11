import React, { useRef } from "react";
import classes from "./RegisterTemplate.module.css";
import Card from "./UI/Card";

const RegisterTemplate = (props) => {
  const template_id = useRef();
  const template_name = useRef();
  const message = useRef();

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_IP}/registerTemplate`, {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          template_id: template_id.current.value,
          template_name: template_name.current.value,
          message: message.current.value,
          token: localStorage.getItem("isLoggedIn"),
        }),
      });
      const data = await response.json();

      alert(data.status);
      if (data.data) props.setTEMPLATES(data.data);
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <div className={classes.body}>
      <Card>
        <button
          className={classes.button}
          style={{ marginLeft: "250px" }}
          onClick={() => props.setAddingTemplate(false)}
        >
          Close
        </button>
        <form className={classes.form} onSubmit={submitHandler}>
          <div className={classes["form-field"]}>
            <label className={classes.label} htmlFor="template_id">
              Template Id:{" "}
              <input
                required
                className={classes.input}
                ref={template_id}
                type="text"
                id="template_id"
                name="template_id"
                placeholder="Template Id"
              />
            </label>
          </div>
          <div className={classes["form-field"]}>
            <label className={classes.label} htmlFor="template_name">
              Template Name:{" "}
              <input
                required
                className={classes.input}
                ref={template_name}
                type="text"
                id="template_name"
                name="template_name"
                placeholder="Template Name"
              />
            </label>
          </div>
          <div className={classes["form-field"]}>
            <label className={classes.label} htmlFor="message">
              Message:{" "}
              <input
                required
                className={classes.input}
                ref={message}
                type="text"
                id="message"
                name="message"
                placeholder="Message"
              />
            </label>
          </div>
          <button type="submit" className={classes.btn}>
            Register
          </button>
        </form>
      </Card>
    </div>
  );
};

export default RegisterTemplate;
