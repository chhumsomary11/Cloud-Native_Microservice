const express = require("express");
const app = express();

app.post("/studentlogin", (req, res) => {
  res.send("<html><body>INSIDE STUDENT LOGIN API..</body></html>");
});

//VIEW API
app.get("/viewassignment", (req, res) => {
  res.send("<html><body>INSIDE STUDENT VIEW ASSIGNMENT API..</body></html>");
});

//UPDATE API
app.put("/studentupdateprofile", (req, res) => {
  res.send("<html><body>INSIDE STUDENT UPDATE PROFILE API..</body></html>");
});

// START THE EXPRESS SERVER. 5000 is the PORT NUMBER
// BLACK AIRDROP 5000
app.listen(5002, () => console.log("EXPRESS Server Started at Port No: 5000"));
