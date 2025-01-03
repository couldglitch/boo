const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the public directory
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Load user data from JSON file
let users = [];
fs.readFile(path.join(__dirname, 'public', 'data.json'), 'utf8', (err, data) => {
    if (err) throw err;
    users = JSON.parse(data);
});

// Routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        req.session.user = user; // Store user in session
        res.redirect('/dashboard');
    } else {
        res.send('Invalid email or password');
    }
});

/*app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        res.redirect('/');
    }
});*/

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        const username = req.session.user.name; // Get the username from the session
        const useremail = req.session.user.email;
        const userid = req.session.user.deviceid;
        const usercode = req.session.user.code;
        const userstatus = req.session.user.status;


        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Profile Card</title>
    <link rel="stylesheet" href="profile.css">
</head>
<body>
    <div class="profile-card">
        <h2 id="name">${username}</h2>
        <p id="email">${useremail}</p>
        <p id="deviceid">Device ID:<span>${userid}</span></p>

        <p id="key-copy">API Key: <span id="api-key">${usercode}</span></p>
        <p id="status" class="status online">Status: <span>${userstatus}</span></p>
        <button class="copy-key" onclick="copyKey()">Copy Key</button>
        
        <!-- Corrected Logout Button -->
        <form action="/logout" method="POST" style="display: inline;">
            <button class="logout" type="submit">Logout</button>
        </form>
    </div>

    <div class="download-container">
        <h1>Download Our App</h1>
        <p>Click the button below to download the APK file for our application.</p>
        <a href="path/to/your/app.apk" class="download-button" download>Download APK</a>
    </div>
    <script>
        // Set the username in localStorage
        localStorage.setItem('username', '${username}');
        localStorage.setItem('useremail', '${useremail}');
        localStorage.setItem('userid', '${userid}');
        localStorage.setItem('usercode', '${usercode}');
        localStorage.setItem('userstatus', '${userstatus}');



         // This will be replaced by the server-side code
    </script>

    <script src="/script.js"></script>
</body>
</html>
        `);
    } else {
        res.redirect('/');
    }
});


app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.redirect('/');
    });
});




//api script

// Function to read data from public/data.json
const readDataFromFile = () => {
    const filePath = path.join(__dirname, 'public', 'data.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// Function to write data to public/data.json
const writeDataToFile = (data) => {
    const jsonData = JSON.stringify(data, null, 2); // Pretty print with 2 spaces
    const filePath = path.join(__dirname, 'public', 'data.json'); // Path to data.json
    fs.writeFileSync(filePath, jsonData, (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
            console.log('Data written to public/data.json');
        }
    });
};

// Route to write incoming data to public/data.json via URL parameters
app.get('/write-data', (req, res) => {
    // Extract data from query parameters
    const entries = req.query.entries; // Expecting entries to be an array of objects

    // Validate the incoming data
    if (entries) {
        // Parse the entries from the query string
        const dataArray = Array.isArray(entries) ? entries : [entries];

        // Create an array to hold the new data
        const newData = dataArray.map(entry => {
            const { id, name, code } = JSON.parse(entry); // Parse each entry
            return {
                id: parseInt(id, 10),
                name: name,
                code: code
            };
        });

        // Write the new data to public/data.json
        writeDataToFile(newData); // Write as an array for consistency
        res.send('Data has been written to public/data.json');
    } else {
        res.status(400).send('Invalid data format. Please provide entries.');
    }
});

// Endpoint to filter data from public/data.json by id and name
app.get('/filter', (req, res) => {
    const { deviceid, name } = req.query;

    // Check if both id and name are provided
    if (!deviceid || !name) {
        return res.status(400).send('Both id and name query parameters are required');
    }

    // Read the JSON data from public/data.json
    const jsonData = readDataFromFile();

    // Filter the data based on the id and name parameters
    const filteredData = jsonData.filter(item => 
        item.deviceid.toString() === deviceid && item.name.toLowerCase() === name.toLowerCase()
    );

    // Check if any data was found
    if (filteredData.length === 0) {
        return res.status(404).send('No data found for the specified id and name');
    }

    // Return the filtered data
    res.json(filteredData);
});

// Endpoint to get all data from public/data.json
app.get('/data', (req, res) => {
    const jsonData = readDataFromFile();
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonData);
});

// Function to generate a random code
const generateRandomCode = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
};

// Route to generate a random code based on user input
app.get('/generate-code', (req, res) => {
    const length = parseInt(req.query.length); // Expecting length as a query parameter

    // Validate the input
    if (!length || isNaN(length) || length <= 0) {
        return res.status(400).json({ error: 'Please provide a valid length for the code.' });
    }

    // Generate the random code
    const randomCode = generateRandomCode(length);
    res.json({ code: randomCode });
});

// Route to update sensor values based on code using query parameters
app.get('/update', (req, res) => {
    const { code, name,status, sensor1, sensor2, sensor3 } = req.query; // Expecting code and sensor values

    // Validate input
    if (!code) {
        return res.status(400).json({ error: 'Code is required.' });
    }

    // Read the current data
    const data = readDataFromFile();

    // Find the item by code
    const item = data.find(item => item.code === code);
    if (item) {
        // Update sensor values if provided
        if (name) item.name = name;
        if (status) item.status = status;
        if (sensor1) item.sensor1 = sensor1;
        if (sensor2) item.sensor2 = sensor2;
        if (sensor3) item.sensor3 = sensor3;


        writeDataToFile(data); // Write the updated data back to the file
        res.json({ message: 'Sensor values updated successfully.', item });
    } else {
        res.status(404).json({ error: 'Item not found.' });
    }
});





app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
