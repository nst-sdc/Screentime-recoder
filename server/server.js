const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/ok", (req, res) => {
  res.send("OK");
});

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${process.env.PORT || port}`);   
}); 
