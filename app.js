const expres = require("express");
const app = expres();
const mongoose = require("mongoose");
const User = require("./models/users");

var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var crypto = require("crypto");
var key = "password";
var algo = "aes256";

//
const jwt = require("jsonwebtoken");
jwtkey = "jwt";
//

mongoose
  .connect(
    "mongodb+srv://sansgramunhale:Sangram123@cluster0.81bjs.mongodb.net/Auth?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("Connected..");
  });

app.post("/register", jsonParser, function (req, res) {
  var cipher = crypto.createCipher(algo, key);
  var encrypted =
    cipher.update(req.body.password, "utf-8", "hex") + cipher.final("hex");

  console.warn(encrypted);
  const data = new User({
    _id: mongoose.Types.ObjectId(),
    name: req.body.name,
    email: req.body.email,
    address: req.body.address,
    password: encrypted,
  });
  data
    .save()
    .then((result) => {
      jwt.sign({ result }, jwtkey, { expiresIn: "300s" }, (err, token) => {
        res.status(201).json({ token });
      });
      //res.status(201).json(result);
    })
    .catch((err) => console.warn(err));
});

app.post("/login", jsonParser, function (req, res) {
  User.findOne({ email: req.body.email }).then((data) => {
    var decipher = crypto.createDecipher(algo, key);
    var decrypted =
      decipher.update(data.password, "hex", "utf-8") + decipher.final("utf-8");
    if (decrypted == req.body.password) {
      jwt.sign({ data }, jwtkey, { expiresIn: "300s" }, (err, token) => {
        res.status(200).json({ token });
      });
    }
  });
});

app.get("/users", verifyToken, function (req, res) {
  User.find().then((result) => {
    res.status(200).json(result);
  });
});

function verifyToken(req, res, next) {
  const beareHeader = req.headers["authorization"];

  if (typeof beareHeader !== "undefined") {
    const bearer = beareHeader.split(" ");
    console.warn(bearer[1]);
    req.token = bearer[1];
    jwt.verify(req.token, jwtkey, (err, authData) => {
      if (err) {
        res.json({ result: err });
      } else {
        next();
      }
    });
  } else {
    res.send({ result: "Token Not Provided" });
  }
}
app.listen(3000);
