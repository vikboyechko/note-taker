const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// const getNotes = require("./public/assets/js/index");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static(path.join(__dirname, "public")))

    .use(express.urlencoded({ extended: true }))
    .use(express.json())

    .get("/notes", (req, res) =>
        res.sendFile(path.join(__dirname, "/public/notes.html"))
    )

    .get("/api/notes", getNotes)
    .get("/api/notes/:id", readNote)

    .post("/api/notes", postNotes)

    .listen(PORT, () => console.log(`Listening on ${PORT}`));

function getNotes(req, res) {
    const notesFilePath = path.join(__dirname, "./db/db.json");
    const notesContent = fs.readFileSync(notesFilePath, "utf-8");
    const notes = JSON.parse(notesContent);
    res.send(notes);
}

function readNote(req, res) {
    const id = req.params.id;

    // Read all notes from the file
    const notesFilePath = path.join(__dirname, "./db/db.json");
    const notesContent = fs.readFileSync(notesFilePath, "utf-8");
    const allNotes = JSON.parse(notesContent);

    console.log("Note ID:", id);
    console.log("All Notes:", allNotes);

    // Find the note with the specified ID
    const singleNote = allNotes.find((note) => note.id === id);

    if (singleNote) {
        res.json(singleNote);
    } else {
        res.status(404).json({ status: "error", message: "Note not found" });
    }
}

function postNotes(req, res) {
    console.info("POST request received to add a note");
    console.log(req.body);
    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: crypto.randomUUID(),
        };

        // Load existing notes
        const notesFilePath = path.join(__dirname, "./db/db.json");
        const notesContent = fs.readFileSync(notesFilePath, "utf-8");
        const existingNotes = JSON.parse(notesContent);

        // Add the new note
        existingNotes.push(newNote);

        // Write back to the file
        fs.writeFileSync(
            notesFilePath,
            JSON.stringify(existingNotes, null, 2),
            "utf-8"
        );

        console.log(`New note: ${newNote.title} has been written to JSON file`);
        res.status(201).json({ status: "success", data: newNote });
    } else {
        res.status(400).json({
            status: "error",
            message: "Invalid request body",
        });
    }
}
