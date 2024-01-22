const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// const getNotes = require("./public/assets/js/index");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static(path.join(__dirname, "public")))

    .use(express.urlencoded({ extended: true }))

    .get("/notes", (req, res) =>
        res.sendFile(path.join(__dirname, "/public/notes.html"))
    )

    .get("/api/notes", (req, res) => res.send(getNotes()))

    .post("/api/notes", (req, res) => res.send(postNotes()))

    .listen(PORT, () => console.log(`Listening on ${PORT}`));

function getNotes() {
    const notesFilePath = path.join(__dirname, "./db/db.json");
    const notesContent = fs.readFileSync(notesFilePath, "utf-8");
    return JSON.parse(notesContent);
}

function postNotes(req, res) {
    console.info(`${req.method} request received to add a note`);

    const { title, note } = req.body;

    if (title && note) {
        const newNote = {
            title,
            note,
            noteID: crypto.randomUUID(),
        };
        const noteString = JSON.stringify(newNote);
    }

    fs.writeFile("./db/db.json", noteString, (err) =>
        err
            ? console.error(err)
            : console.log(
                  `New note: ${newNote.title} has been written to JSON file`
              )
    );
}
