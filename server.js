'use strict';
require('dotenv').config();
const express = require('express');

const PORT = process.env.PORT || 3030;
const app = express();
const superagent = require('superagent');

app.use(express.static('./public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render('pages/index');
})

app.get('/new',(req,res)=>{
    res.render('pages/searches/new');
})

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
            res.render('pages/searches/show', { book: result })
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
    this.image = (val.volumeInfo.imageLinks && val.volumeInfo.imageLinks.thumbnail) || ' No Image Found ';}

app.get('*', (req, res) => {
    res.status(404).send('This route does not exist!!');
})
app.get('/error', (request, response) => {
    response.render('pages/error');
});
app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
})