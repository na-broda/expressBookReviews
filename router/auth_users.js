const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
// Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
 // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Get book reviews based on ISBN
regd_users.put('/auth/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.session.authorization.username;

    console.log('ISBN:', isbn);
    console.log('Review:', review);
    console.log('Username:', username);

    // Check if ISBN, review, and username are present
   if (!isbn || !review || !username) {
        console.log('Missing required fields');
        return res.status(400).json({ message: "ISBN, review, and username are required." });
    }

    let book = books[isbn];
    if (book) {
       // Ensure book.reviews is an array
        if (!Array.isArray(book.reviews)) {
            book.reviews = [];
        }

        let userReview = book.reviews.find(r => r.username === username);
        if (userReview) {
            userReview.review = review;
            console.log('Review updated:', userReview);
        } else {
            book.reviews.push({ username: username, review: review });
            console.log('Review added:', { username: username, review: review });
        }

        console.log('Updated reviews:', book.reviews); // Log the updated reviews for debugging
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "No book found with the given ISBN" });
    }
});

regd_users.delete("/auth/review/:isbn", async (req, res) => {
        const { isbn } = req.params;
    const username = req.session.authorization.username;

    console.log('ISBN:', isbn);
    console.log('Username:', username);

    if (!isbn || !username) {
        console.log('Missing required fields');
        return res.status(400).json({ message: "ISBN and username are required." });
    }

    let book = books[isbn];
    if (book) {
        if (Array.isArray(book.reviews)) {
            const initialLength = book.reviews.length;
            book.reviews = book.reviews.filter(review => review.username !== username);

            if (book.reviews.length < initialLength) {
                console.log('Review deleted');
                return res.status(200).json({ message: "Review deleted successfully.", reviews: book.reviews });
            } else {
                console.log('Review not found');
                return res.status(404).json({ message: "Review not found for the given username." });
            }
        } else {
            console.log('No reviews found');
            return res.status(404).json({ message: "No reviews found for this book." });
        }
    } else {
        console.log('Book not found');
        return res.status(404).json({ message: "Book not found." });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
