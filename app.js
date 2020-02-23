// Required dependencies

const express = require("express");
const fs = require("fs");
const { parse } = require("querystring");

const app = express();

app.use(express.static("public"));

// Create heroku port and local port

let PORT = process.env.PORT || 8080;

// Create Home Page Route

app.get("/", (req, res, next) => {
    res.status(200).sendFile(__dirname + "/public/index.html");
});

// Create Note page Route

app.get("/notes", (req, res, next) => {
    res.status(200).sendFile(__dirname + "/public/notes.html");
});

// Grab Notes from DB

app.get("/api/notes", (req, res, next) => {
    try {
        fs.readFile(__dirname + "/db/db.json", "utf-8", (err, data) => {
            if (err) {
                throw Error(err);
            }
            const jsonData = JSON.parse(data);
            res.status(200).send(jsonData);
        })
    } catch (err) {
        console.error(err);
        res.status(404).send();
    }
});

// Send Notes to DB and assign an id to the note

app.post("/api/notes", (req, res, next) => {
    let body = "";
    req.on("data", data => {
        body += data.toString();
    }).on("end", () => {
        const newNote = parse(body);

        if (Object.keys(newNote).length !== 0) {
            fs.readFile(__dirname + "/db/db.json", "utf-8", (err, data) => {
                if (err) {
                    throw err;
                }
                data = JSON.parse(data);
                newNote.id = data.length;
                data.push(newNote);

                fs.writeFile(__dirname + "/db/db.json", JSON.stringify(data), err => {
                    if (err) throw err;
                    console.log("Success!")
                })
            });
            res.send(newNote);
        } else {
            throw new Error("Something went wrong!");
        }
    })
});

// Create Delete note route

app.delete("/api/notes/:id", (req, res, next) => {
    const id = req.params.id;
    fs.readFile(__dirname + "/db/db.json", "utf-8", (err, notes) => {
        if (err) {
            throw err;
        }
        notes = JSON.parse(notes);
        for (let i = 0; i < notes.length; i++) {
            if (notes[i].id === parseInt(id)) {
                notes.splice(i, 1);
            }
        }
        fs.writeFile(__dirname + "/db/db.json", JSON.stringify(notes), err => {
            if (err) throw err;
            console.log("Success!")
        })
    });
    res.send("Deleted");
});

app.listen(PORT, () => console.log("App is listening on PORT 8080"));