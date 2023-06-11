import React, { useState, useRef } from "react";
import classes from "./Form.module.css";
import readXlsxFile from "read-excel-file";
import Modal from "./UI/Modal";
import RegisterTemplate from "./RegisterTemplate";

const Form = (props) => {
  const [templateEntry, setTemplate] = useState("");
  const [checkDuplicate, setCheckDuplicate] = useState(false);
  const [checkInvalid, setCheckInvalid] = useState(false);
  const [msgSent, setMsgSent] = useState("");
  const [addingTemplate, setAddingTemplate] = useState(false);

  const contacts = useRef();
  const TEXT_MSG = useRef();
  const TEMPLATE_ID = useRef();

  const templateHandler = (event) => {
    for (let msg of props.templates) {
      if (msg.template_id === event.target.value) {
        setTemplate(msg.message);
        return;
      }
    }
  };

  const messageChanger = (event) => {
    setTemplate(event.target.value);
  };

  const checkDuplicateHandler = () => {
    setCheckDuplicate((checkDuplicate) => {
      return !checkDuplicate;
    });
    if (!checkDuplicate) {
      contacts.current.value =
        [...new Set(contacts.current.value.trim().split("\n"))].join("\n") +
        "\n";
    }
  };

  function phonenumber(inputtxt) {
    var phno = /^\d{10}$/;
    return phno.test(inputtxt);
  }

  const checkInvalidHandler = () => {
    setCheckInvalid((checkInvalid) => {
      return !checkInvalid;
    });
    if (!checkInvalid) {
      let arr = contacts.current.value.trim().split("\n");
      arr = arr.filter(phonenumber);
      contacts.current.value = arr.join("\n") + "\n";
    }
  };

  const fileHandler = (event) => {
    let file = event.target.files[0];
    if (!file) return;
    let fileExtension = file.name.split(".").pop();
    if (fileExtension === "csv" || fileExtension === "txt") {
      const fr = new FileReader();
      fr.onload = function () {
        contacts.current.value += fr.result + "\n";
      };
      fr.readAsText(file);
    } else {
      readXlsxFile(file).then((rows) => {
        rows.forEach((row) => {
          row.forEach((entry) => {
            contacts.current.value += entry + "\n";
          });
        });
      });
    }
  };

  const messageSentHandler = (value) => {
    setMsgSent({
      Contacts: value.contacts,
      Message: value.message,
      response: value.response,
    });
  };

  const modalHandler = (event) => {
    if (event.target.value === "close") {
      contacts.current.value = "";
      TEMPLATE_ID.current.value = "none";
      setTemplate("");
    }
    setMsgSent(null);
  };

  const addTemplateHandler = () => {
    setAddingTemplate(true);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setCheckDuplicate(true);
    setCheckInvalid(true);
    try {
      contacts.current.value =
        [...new Set(contacts.current.value.trim().split("\n"))].join("\n") +
        "\n";
      let arr = contacts.current.value.trim().split("\n");
      arr = arr.filter(phonenumber);
      contacts.current.value = arr.join("\n") + "\n";

      const CONTACT_NUMS = contacts.current.value.trim().replaceAll("\n", ",");

      if (CONTACT_NUMS === "") throw new Error("Enter Valid Contact Details");

      const response = await fetch("/apiCall", {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          TEXT_MSG: TEXT_MSG.current.value,
          TEMPLATE_ID: TEMPLATE_ID.current.value,
          CONTACT_NUMS,
          token: localStorage.getItem("isLoggedIn"),
          ...props.info,
        }),
      });

      const sentMsg = {
        contacts: CONTACT_NUMS,
        message: TEXT_MSG.current.value,
        response: await response.text(),
      };
      messageSentHandler(sentMsg);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <React.Fragment>
      {addingTemplate && (
        <RegisterTemplate
          setAddingTemplate={setAddingTemplate}
          setTEMPLATES={props.setTEMPLATES}
        />
      )}
      {!addingTemplate && (
        <div className={classes.arbitrary}>
          <form className={classes.form} onSubmit={submitHandler}>
            <button
              type="button"
              className={classes.button}
              style={{ float: "right" }}
              onClick={addTemplateHandler}
            >
              Register a Template
            </button>
            <button
              type="button"
              className={classes.button}
              style={{ float: "right" }}
              onClick={props.onLogout}
            >
              Log Out
            </button>
            <label className={classes.label} htmlFor="company">
              Company Name:{" "}
              <select className={classes.select} name="company" id="company">
                <option value="BHELRP">BHELRP</option>
              </select>
            </label>

            <label className={classes.label} htmlFor="contact">
              Contact Details:{" "}
            </label>
            <textarea
              className={classes.textarea}
              rows="20"
              cols="50"
              name="contact"
              id="contact"
              ref={contacts}
              required
              placeholder="Enter contact details separated by a new line"
            ></textarea>
            <label
              className={`${classes.label} ${classes.checkbox}`}
              htmlFor="removeDuplicates"
            >
              <input
                className={classes.inputcheck}
                type="checkbox"
                id="removeDuplicates"
                name="removeDuplicates"
                onChange={checkDuplicateHandler}
                checked={checkDuplicate}
              />
              Remove Duplicates&emsp;
            </label>

            <label
              className={`${classes.label} ${classes.checkbox}`}
              htmlFor="removeInvalid"
            >
              <input
                className={classes.inputcheck}
                type="checkbox"
                id="removeInvalid"
                name="removeInvalid"
                onChange={checkInvalidHandler}
                checked={checkInvalid}
              />
              Remove Invalid&emsp;
            </label>
            <label
              className={`${classes.label} ${classes.link}`}
              htmlFor="file"
            >
              Text/Excel(Contacts)
              <input
                type="file"
                id="file"
                className={classes.file}
                onChange={fileHandler}
              ></input>
            </label>

            <label className={classes.label} htmlFor="message">
              Message:{" "}
            </label>
            <textarea
              className={classes.textarea}
              rows="60"
              cols="80"
              name="message"
              id="message"
              value={templateEntry}
              ref={TEXT_MSG}
              onChange={messageChanger}
              required
              placeholder="Enter the message to be sent"
            ></textarea>
            <label className={classes.label} htmlFor="template">
              Template Name:{" "}
              <select
                className={classes.select}
                name="template"
                id="template"
                onChange={templateHandler}
                defaultValue="none"
                ref={TEMPLATE_ID}
                required
              >
                <option value="none" disabled hidden>
                  Select a Template
                </option>
                {props.templates.map((record) => {
                  return (
                    <option key={record.template_id} value={record.template_id}>
                      {record.template_name}
                    </option>
                  );
                })}
              </select>
            </label>
            <button
              className={classes.button}
              type="submit"
              name="button"
              id="button"
            >
              Send Message
            </button>
          </form>
          {msgSent && (
            <Modal>
              <p className={classes.display}>||{msgSent.response}||</p>
              {"Contacts: " +
                msgSent.Contacts +
                "\n" +
                "Message: " +
                msgSent.Message}
              <button
                className={classes.button}
                onClick={modalHandler}
                value="stay"
              >
                Use Same Inputs
              </button>
              <button
                className={classes.button}
                onClick={modalHandler}
                value="close"
              >
                Use Different Inputs
              </button>
            </Modal>
          )}
        </div>
      )}
    </React.Fragment>
  );
};

export default Form;
