'use strict';
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const PORT = process.env.PORT || 3030;
const app = express();
const superagent = require('superagent');

app.use(express.static('./public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const client = new pg.Client(process.env.DATABASE_URL);
client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Listening on PORT ${PORT}`)
        })
    })
app.get('/', (req, res) => {
    let SQL = 'SELECT * FROM allBooks;';
    return client.query(SQL)
    .then(results =>{
        res.render('pages/index',{taskResults:results.rows});
    })
})

app.get('/new', (req, res) => {
    res.render('pages/searches/new');
})

app.post('/add', (req, res) => {

    res.render('pages/searches/add',{books:req.body});

   })
app.post('/books', (req,res) =>
{
     let {image, title, author, description} = req.body;
    // console.log(req.body);
    let SQL = 'INSERT INTO allBooks (title,author,description,image) VALUES ($1,$2,$3,$4);';

    let safeValues = [title, author, description, image];
    return client.query(SQL, safeValues)
        .then(() => {
            res.redirect('/');
        })
   
});
app.get('/tasks/:task_id', (req ,res)=>{
    let SQL = 'SELECT * FROM allBooks WHERE id=$1;';
    let values = [req.params.task_id];
    return client.query(SQL,values)
    .then (result =>{
        res.render('pages/book/details',{task:result.rows[0]});
    })
});

app.post('/searches', (req, res) => {
    let url = `https://www.googleapis.com/books/v1/volumes?q=`;
    // console.log(' titleeeelllllllllllllllllll', req.body.title);
    // console.log(' authorrrrrrlllllllllllllllllll', req.body.author);

    // console.log(' searchurlllllllllllllllllll', req.body.search);

    if (req.body.title === 'on') {
        url += `+intitle:${req.body.search}`;
        // console.log("tttttttttttttt",url);


    } else if (req.body.author === 'on') {
        url += `+inauthor:${req.body.search}`;
        // console.log("tttttttttttttt",url);
    }

    superagent.get(url)
        .then(data => {
            let result = data.body.items.map(val => {
                // console.log("bbbbbbbbbbbbbbbbbbbbb",val.volumeInfo.title);
                return new books(val);

            })

            res.render('pages/book/show', { book: result })
            // console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", result)

        })
        .catch(error => {
            res.render('pages/error');
        });
})

function books(val) {
    this.title = val.volumeInfo.title;
    this.author = (val.volumeInfo.authors && val.volumeInfo.authors[0]) || ' Unknown Authors';
    this.description = val.volumeInfo.description;
    this.image = (val.volumeInfo.imageLinks && val.volumeInfo.imageLinks.thumbnail) || ' No Image Found ';
}

app.get('*', (req, res) => {
    res.status(404).send('This route does not exist!!');
})
app.get('/error', (request, response) => {
    response.render('pages/error');
});
