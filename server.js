// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to serve static files
app.use(express.static('public'));

// Endpoint to write JSON data to a file via GET request
app.get('/write-json', (req, res) => {
    const jsonData = req.query; // Get data from query parameters

    // Write the received data to data.json
    fs.writeFile(path.join(__dirname, 'public/data.json'), JSON.stringify(jsonData, null, 2), (err) => {
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