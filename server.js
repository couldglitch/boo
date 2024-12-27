// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to serve static files
app.use(express.static('public'));

app.get('/rest/v1/7bg89ds39dbvfd1b5783/g/client/value', (req, res) => {
    
    res.sendFile(__dirname + '/public/rest/v1/7bg89ds39dbvfd1b5783/g/client/value.json')

});

// Endpoint to write JSON data to a file via GET request
app.get('/rest/v1/7bg89ds39dbvfd1b5783/p/client/write', (req, res) => {
    const jsonData = req.query; // Get data from query parameters

    // Write the received data to data.json
    fs.writeFile(path.join(__dirname, 'public/rest/v1/7bg89ds39dbvfd1b5783/g/client/value.json'), JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Error writing file');
        }
        res.send('JSON data written to file');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
