const express = require('express');
const books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", async (req,res) => {
    const { username, password } = req.body;
    // Check if both username and password are provided
   
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
     // check if the user already exists
    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }
     // if all the above are negative then...
    users.push({ username, password });
    return res.status(201).json({ message: 'User' +{username}+ 'successfully registered. Now you can login.' });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        const data = await new Promise((resolve, reject) => {
            resolve({ books });
        });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    return res.status(200).json({ books });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params;
    return new Promise((resolve, reject) => {
        const book = Object.values(books).find(book => book.isbn === isbn);
        if (book) {
            resolve(book);
        } else {
            reject({ message: "No book found with the given ISBN." });
        }
    })
    .then(data => res.status(200).json(data))
    .catch(err => res.status(404).json(err));
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    return new Promise((resolve, reject) => {
        // Convert books object to an array
        const booksArray = Object.values(books);

        // Filter books by the given author
        const booksByAuthor = booksArray.filter(book => book.author === author);

        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject({ message: "No books found for the given author" });
        }
    })
    .then(data => res.status(200).json(data))
    .catch(err => res.status(404).json(err));
});

public_users.get('/title/:title', async (req, res) => {
    const { title } = req.params;
    return new Promise((resolve, reject) => {
        const booksByTitle = Object.values(books).filter(book => book.title === title);

        if (booksByTitle.length > 0) {
            resolve(booksByTitle);
        } else {
            reject({ message: "No books found for the given title." });
        }
    })
    .then(data => res.status(200).json(data))
    .catch(err => res.status(404).json(err));
});


// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // Assuming each book object has a 'reviews' property which is an array of reviews hopefully and it does have one if you are reading this, why?
    let filtered_books = Object.values(books).filter(book => book.isbn === isbn);

    if (filtered_books.length > 0) {
        return res.status(200).json(filtered_books[0].reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for the given ISBN" });
    }
});

module.exports.general = public_users;
