'use strict';
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const PORT = process.env.PORT || 3030;
const app = express();
const superagent = require('superagent');
const methodOverride = require('method-override');
const client = new pg.Client(process.env.DATABASE_URL);


app.use(express.static('./public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');


app.get('/', renderHome);
app.get('/new', newSearch);
app.post('/searches', searchResult);
app.post('/add', selected);
app.post('/books',addToDB);
app.get('/book/:book_id', viewDetails);
app.put('/update/:book_id', update);
app.delete('/delete/:book_id', deleteBook);
app.get('*', notExistRout);
app.get('/error',errorType);


function renderHome(req, res){
    let SQL = 'SELECT * FROM allBooks;';
    return client.query(SQL)
    .then(results => {
        res.render('pages/index', { books: results.rows });
        })
    };


function newSearch(req, res){
    res.render('pages/searches/new');
};

function searchResult(req, res){
    let url = `https://www.googleapis.com/books/v1/volumes?q=`;
    
    
    if (req.body.title === 'on') {
        url += `+intitle:${req.body.search}`;
        
        
    } else if (req.body.author === 'on') {
        url += `+inauthor:${req.body.search}`;
    }
    
    superagent.get(url)
    .then(data => {
        let result = data.body.items.map(val => {
                return new books(val);
                
            })
            
            res.render('pages/book/show', { book: result })
            
        })
        .catch(error => {
            res.render('pages/error');
        });
};

function books(val) {
    this.title = val.volumeInfo.title;
    this.author = (val.volumeInfo.authors && val.volumeInfo.authors[0]) || ' Unknown Authors';
    this.description = val.volumeInfo.description;
    this.image = (val.volumeInfo.imageLinks && val.volumeInfo.imageLinks.thumbnail) || ' No Image Found ';
}

function selected (req, res){

    res.render('pages/searches/add', { books: req.body });

} ;

function addToDB (req, res){
    let { image, title, author, description } = req.body;
    let SQL = 'INSERT INTO allBooks (title,author,description,image) VALUES ($1,$2,$3,$4);';
    
    let safeValues = [title, author, description, image];
    return client.query(SQL, safeValues)
    .then(() => {
        res.redirect('/');
    })
    
};

function viewDetails(req, res) {
    let SQL = 'SELECT * FROM allBooks WHERE id=$1;';
    let values = [req.params.book_id];
    return client.query(SQL, values)
    .then(result => {
        res.render('pages/book/details', { book: result.rows[0] });
    })
};

function update(req,res) {
    let { title, author, description, image } = req.body;
    let SQL = 'UPDATE allBooks SET title=$1,author=$2,description=$3,image=$4 WHERE id=$5;';
    let safeValues = [title, author, description, image, req.params.book_id];
    client.query(SQL, safeValues)
    .then(res.redirect(`/book/${req.params.book_id}`))
};

function deleteBook (req, res){
    let SQL = 'DELETE FROM allBooks WHERE id=$1';
    let value = [req.params.book_id];
    client.query(SQL, value)
    .then(res.redirect('/'))
};



function notExistRout (req, res) {
    res.status(404).send('This route does not exist!!');
};


function errorType (request, response) {
    response.render('pages/error');
};


client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Listening on PORT ${PORT}`)
        })
    })