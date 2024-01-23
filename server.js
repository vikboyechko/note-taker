const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto'); // built-in unique id generator

const PORT = process.env.PORT || 3001;
const app = express();

// all express routing contained in an easy to read section
app
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .get('/notes', (req, res) => res.sendFile(path.join(__dirname, '/public/notes.html')))
  .get('/api/notes', getNotes)
  .get('/api/notes/:id', readNote)
  .delete('/api/notes/:id', deleteNote)
  .post('/api/notes', postNotes)
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

// function to get a list of all the previoualy saved notes
function getNotes(req, res) {
  const notesFilePath = path.join(__dirname, './db/db.json');
  const notesContent = fs.readFileSync(notesFilePath, 'utf-8');
  const notes = JSON.parse(notesContent);
  res.send(notes);
}

// function to allow selecting one note and reading it
function readNote(req, res) {
  const id = req.params.id; // assign the 'id' query parameter

  // read all notes from the file, could be changed to async method later
  const notesFilePath = path.join(__dirname, './db/db.json');
  const notesContent = fs.readFileSync(notesFilePath, 'utf-8');
  const allNotes = JSON.parse(notesContent);

  // find the note with the specified ID
  const singleNote = allNotes.find((note) => note.id === id);

  // if the ID exists, return that note, or show error
  if (singleNote) {
    res.json(singleNote);
  } else {
    res.status(404).json({ status: 'error', message: 'Note not found' });
  }
}

// function to delete a note from db.json
function deleteNote(req, res) {
  const id = req.params.id;

  const notesFilePath = path.join(__dirname, './db/db.json');
  const notesContent = fs.readFileSync(notesFilePath, 'utf-8');
  const allNotes = JSON.parse(notesContent);

  // need to search for the specific index of the note, to splice it
  const noteIndex = allNotes.findIndex((note) => note.id === id);

  // if the note index is found, remove it from the allNotes array of notes
  if (noteIndex !== -1) {
    const deletedNote = allNotes.splice(noteIndex, 1)[0];

    fs.writeFileSync(notesFilePath, JSON.stringify(allNotes, null, 2), 'utf-8');

    // show success/error message to the requester
    res.json({ status: 'success', data: deletedNote });
  } else {
    res.status(404).json({ status: 'error', message: 'Note not found' });
  }
}

// function to POST a new note
function postNotes(req, res) {
  console.info('POST request received to add a note'); // logs a request in the backend console
  console.log(req.body); // logs the requested new note POST

  // destructures variables title and text from the POST body
  const { title, text } = req.body;

  // if title and text exist in the POST, create a new note object with title, text, and random id
  if (title && text) {
    const newNote = {
      title,
      text,
      id: crypto.randomUUID(),
    };

    // load existing notes
    const notesFilePath = path.join(__dirname, './db/db.json');
    const notesContent = fs.readFileSync(notesFilePath, 'utf-8');
    const allNotes = JSON.parse(notesContent);

    // add the new note to the allNotes array
    allNotes.push(newNote);

    // Write back to the file
    fs.writeFileSync(notesFilePath, JSON.stringify(allNotes, null, 2), 'utf-8');

    console.log(`New note: ${newNote.title} has been written to JSON file`);

    // show success/error message to the requester
    res.status(201).json({ status: 'success', data: newNote });
  } else {
    res.status(400).json({
      status: 'error',
      message: 'Invalid request body',
    });
  }
}
