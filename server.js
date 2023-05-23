// Required Libraries
const express = require('express');
const path = require('path');
const fs = require('fs');

// Potential use of uuid (to be determined later)
const uuid = require('./helpers/uuid');


// PORT
const PORT = process.env.PORT || 3001;


// App instance of express
const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));

});

// GET request for notes
app.get('/api/notes', (req, res) => {
    // Read the contents of the db.json file
    const notes = JSON.parse(fs.readFileSync(path.join(__dirname, './db/db.json')));
    console.log(notes);
    // Send the notes as a JSON response
    res.json(notes);
    // Log our request to the terminal
    console.info(`${req.method} request received to get notes`);
});

app.post('/api/notes', (req, res) => {
    // Deconstruct the request body
    const { title, text } = req.body;
    if (title && text) {
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading data file');
                console.error(err);
            }
            else {
                const notes = JSON.parse(data);
                const createNote = {
                    id: uuid(),
                    title,
                    text,
                }
                // Let user know their note was created
                const response = {
                    status: 'success',
                    body: createNote,
                };
                // This will add the new note to the db.json file
                notes.push(createNote);
                fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        res.json(response);
                        console.info(`${req.method} request received to add note`);
                    }
                });
            }
        });
    } else {
        res.status(400).send('Please include a title and text for the note.');
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);