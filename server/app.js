const express = require("express");
const logger = require("morgan");
const createError = require("http-errors");
const path = require("path");

// APP
const app = express();
// DEBUG
app.use(logger("dev"));

// ================ //
// view engine setup
// ================ //
app.set("views", path.join(__dirname, "web", "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "web", "public")));

// \/\/\/\/\/\/\/\/\ //
// ================ //
// ROUTES //
// ================ //
app.use("/", require("./routes/tweet"));
// Don't create an error if favicon is requested
app.use((req, res, next) => {
  if (req.originalUrl && req.originalUrl.split("/").pop() === "favicon.ico") {
    return res.sendStatus(204);
  }
  return next();
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render my error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
