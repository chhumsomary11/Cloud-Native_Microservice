const express = require('express');
const app = express();

app.post('/addassignment', (req, res) => {
    res.send('<html><body>INSIDE TEACHER ADD ASSIGNMENT API..</body></html>');
});

//VIEW API
app.get('/searchstudent', (req, res) => {
    res.send('<html><body>INSIDE TEACHER SEARCH STUDENT API..</body></html>');
});


//UPDATE API
app.delete('/removeassignment', (req, res) => {
    res.send('<html><body>INSIDE TEACHER REMOVE ASSIGNMENT API..</body></html>');
});

// START THE EXPRESS SERVER. 5000 is the PORT NUMBER
app.listen(5001, () =>
    console.log('EXPRESS Server Started at Port No: 5001'));


