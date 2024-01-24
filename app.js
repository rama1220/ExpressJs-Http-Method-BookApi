import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json())
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        throw err;
    }
    console.log('Connected to database:', process.env.DB_DATABASE);
});

// Middleware untuk mengizinkan server menerima data JSON dari request
app.use(express.json());

// Endpoint untuk menampilkan semua data dari tabel "books"
app.get('/books', (req, res) => {
    const query = 'SELECT * FROM books';

    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({
                error: 'Internal Server Error'
            });
        }
        res.status(200).json(rows);
    });
});

// Endpoint untuk pencarian berdasarkan ID
app.get('/books/:id', (req, res) => {
    const bookId = req.params.id;
    const query = 'SELECT * FROM books WHERE id = ?';

    db.query(query, [bookId], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({
                error: 'Internal Server Error'
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Book not found'
            });
        }

        res.status(200).json(rows[0]);
    });
});

// Endpoint untuk menambahkan data baru ke tabel "books"
app.post('/books', (req, res) => {
    const {
        id,
        title,
        author,
        production_year
    } = req.body;

    if (!id || !title || !author || !production_year) {
        return res.status(400).json({
            error: 'Missing required fields'
        });
    }

    const query = 'INSERT INTO books (id, title, author, production_year) VALUES (?,?,?,?)';

    db.query(query, [id, title, author, production_year], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({
                error: 'Internal Server Error'
            });

        }

        const insertedId = result.insertId;

        res.status(201).json({
            message: 'Data has been inserted'
        });
    });
});

// Endpoint untuk mengubah data berdasarkan ID
app.put('/books/:id', (req, res) => {
    const bookId = req.params.id;
    const {
        title,
        author,
        production_year
    } = req.body;

    if (!title) {
        return res.status(400).json({
            error: 'Missing required fields'
        });
    }

    const query = 'UPDATE books SET title = ?, author = ?, production_year = ? WHERE id = ?';

    db.query(query, [title, author, production_year, bookId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({
                error: 'Internal Server Error'
            });
        }

        res.status(200).json({
            message: 'Data has been updated'
        });
    });
});

app.patch('/books/:id', (req, res) => {
    const bookId = req.params.id;
    const updatedData = req.body;

    if (Object.keys(updatedData).length === 0) {
        return res.status(400).json({
            error: 'No fields to update'
        });
    }

    const columns = Object.keys(updatedData);
    const values = columns.map(column => updatedData[column]);

    const setClause = columns.map(column => `${column} = ?`).join(', ');

    const query = `UPDATE books SET ${setClause} WHERE id = ?`;

    db.query(query, [...values, bookId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({
                error: 'Internal Server Error'
            });
        }

        res.status(200).json({
            message: 'Data has been updated partially'
        });
    });
});

// Endpoint untuk menghapus data berdasarkan ID
app.delete('/books/:id', (req, res) => {
    const bookId = req.params.id;
    const query = 'DELETE FROM books WHERE id = ?';

    db.query(query, [bookId], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({
                error: 'Internal Server Error'
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Book not found'
            });
        }

        res.status(200).json({
            message: 'Data has been deleted'
        });
    });
});


export default app;