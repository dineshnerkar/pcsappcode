var express = require("express");
const helmet = require("helmet");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const compression = require("compression");
const fs = require('fs');
const docDir = './docs';
const outputDir = './output';
const templateDir = './templates';
const formFiledTemplate = './formFiledTemplate'

if (!fs.existsSync(docDir)) {
  fs.mkdirSync(docDir);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}


if (!fs.existsSync(templateDir)) {
  fs.mkdirSync(templateDir);
}

if (!fs.existsSync(formFiledTemplate)) {
  fs.mkdirSync(formFiledTemplate);
}

var app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: "GET,PUT,POST,DELETE",
  })
);
app.use(compression());

app.get("/download/:docId", function (req, res) {
  const file = "/output/" + req.params.docId;
  res.sendFile(__dirname + file);
});

app.use(logger("dev"));
app.use(
  express.json({
    limit: "5mb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb",
    parameterLimit: 10,
  })
);
app.use(cookieParser());

app.options("*", (req, res) => {
  res.send(200);
});

module.exports = app;
