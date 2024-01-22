var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const saltRounds = 10;
var jwt = require("jsonwebtoken");
const secret = "secretkey";

var app = express();
app.use(cors());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "registerlogin",
});

app.post("/register", jsonParser, function (req, res, next) {
  if (
    !req.body.email ||
    !req.body.password ||
    !req.body.FirstName ||
    !req.body.LastName
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    connection.execute(
      "INSERT INTO Customer(email, password, FirstName, LastName) VALUES (?, ?, ?, ?)",
      [req.body.email, hash, req.body.FirstName, req.body.LastName],
      function (err, results, fields) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        console.log("Query results:", results);

        return res
          .status(200)
          .json({ success: true, message: "User registered successfully" });
      }
    );
  });
});

app.post("/login", jsonParser, function (req, res, next) {
  connection.execute(
    "SELECT * FROM Customer WHERE email = ?",
    [req.body.email],
    function (err, Customer, fields) {
      if (err) {
        console.error("Error executing SQL query:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (Customer.length === 0) {
        return res.status(404).json({ error: "Customer not found" });
      }

      bcrypt
        .compare(req.body.password, Customer[0].password)
        .then(function (isLogin) {
          if (isLogin) {
            var token = jwt.sign({ email: Customer[0].email }, secret, {
              expiresIn: "1h",
            });
            return res
              .status(200)
              .json({ success: true, message: "Log-in successfully", token });
          } else {
            return res.status(401).json({ error: "Invalid password" });
          }
        })
        .catch(function (bcryptError) {
          console.error("Error comparing passwords:", bcryptError);
          return res.status(500).json({ error: "Internal Server Error" });
        });
    }
  );
});

app.post("/authen", jsonParser, function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    var decodeed = jwt.verify(token, secret);
    res.json({ status: "ok", decodeed });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

app.listen(80, function () {
  console.log("CORS-enabled web server listening on port 80");
});
