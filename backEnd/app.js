require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const ldap = require("ldapjs");
const Parse = require("parse").Parse;

const PORT = process.env.PORT || 5000;

const JWT_SECRET =
  "0ed89db496d8bdb7e097ee4c08a5809d92899edb4121b64b089e0bba19108b507450683bd377ab4a3ff95f35f8961b2dd64fccec82ab9c9507383a25f9f5bb9d";

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.get("/templates", (req, res) => {
  fs.readFile(__dirname + "/data/" + "templates.json", "utf-8", (err, data) => {
    if (err) {
      res.send({ status: "Cannot read templates data" });
      return;
    } else {
      try {
        data = JSON.parse(data);
        res.send(data);
      } catch (error) {
        res.send({ status: error.message });
      }
    }
  });
});

app.post("/apiCall", async (req, res) => {
  const { TEXT_MSG, TEMPLATE_ID, CONTACT_NUMS, token, username, loginDate } =
    req.body;

  const API = `UseYourAPIHere`;

  try {
    if (TEMPLATE_ID === "none") {
      throw new Error("Select a valid Template");
    }
    if (!username || !CONTACT_NUMS || !TEXT_MSG || !token || !loginDate) {
      throw new Error("Unauthorized Access!!!");
    }
    if (TEXT_MSG.includes("{#var#}")) {
      throw new Error("Invalid Message replace {#var#} entries");
    }
    const user = jwt.verify(token, JWT_SECRET);
    const response = await fetch(API, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;
    const formattedToday = dd + "-" + mm + "-" + yyyy;
    const toWrite = {
      username: user.username,
      LoggedIn: loginDate,
      contacts: CONTACT_NUMS,
      message: TEXT_MSG,
      API_CALL: today.toLocaleString(),
    };
    fs.appendFile(
      __dirname + "/appLogs/" + `${formattedToday}.log`,
      `${JSON.stringify(toWrite, null, 2)}\n`,
      (err) => {
        if (err) {
          res.send({ status: "Error in writing log" });
          return;
        }
      }
    );
  } catch (error) {
    if (error.message === "invalid token") {
      res.send({ status: "Session Expired Logout and login again" });
    } else res.send({ status: error.message });
    return;
  }

  res.send("API CALL MADE!!!");
});

app.post("/registerTemplate", (req, res) => {
  const { template_id, template_name, message, token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    res.send({
      status: `Not a valid user`,
    });
    return;
  }
  fs.readFile(__dirname + "/data/" + "templates.json", "utf-8", (err, data) => {
    if (err) {
      res.send({ status: "Cannot access template data" });
      return;
    } else {
      try {
        data = JSON.parse(data);
        for (let template of data) {
          if (template.template_id === template_id) {
            throw new Error("Template already exists");
          }
        }
        data.push({ template_id, template_name, message });
        fs.writeFile(
          __dirname + "/data/" + "templates.json",
          JSON.stringify(data, null, 2),
          (err) => {
            if (err) {
              res.send({ status: "Cannot store template data" });
              return;
            }
            res.send({ status: "Template Registered", data });
            return;
          }
        );
      } catch (error) {
        if (error.message === "invalid token") {
          res.send({ status: "Session Expired Logout and login again" });
        } else res.send({ status: error.message });
      }
    }
  });
});

const authenticatDN = async (username, password) => {
  try {
    const promise = new Promise((resolve, reject) => {
      const client = ldap.createClient({
        url: "ldap://bapdc1.baprpt.co.in",
      });

      const ldaprdn = "baprpt" + "\\" + username;
      client.bind(ldaprdn, password, (err, res) => {
        if (err) {
          client.unbind();
          return reject(
            new Parse.Error(
              Parse.Error.OBJECT_NOT_FOUND,
              "LDAP: Wrong username or password"
            )
          );
        }
        client.unbind();
        return resolve(res);
      });
    });
    const response = await promise;
    return "Valid User";
  } catch (err) {
    return err.message;
  }
};

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  //used for testing
  if (username === "harish") {
    res.send({
      status: "ok",
      token: jwt.sign({ username }, JWT_SECRET, {
        expiresIn: "30m",
      }),
    });
    return;
  }
  authenticatDN(username, password).then((data) => {
    try {
      if (data !== "Valid User") throw new Error("Invalid User");
      res.send({
        status: "ok",
        token: jwt.sign({ username }, JWT_SECRET, {
          expiresIn: "30m",
        }),
      });
    } catch (error) {
      res.send({ status: error.message });
    }
  });
});

app.listen(PORT, () => {
  console.log("Server Started");
});
