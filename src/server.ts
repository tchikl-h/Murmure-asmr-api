import express = require('express');
import * as path from 'path';
import * as request from 'request';
import Controller from './Controller';
import * as fs from 'fs';

const port = process.env.PORT || 5001;
const app = express();
let access_token = '';
let refresh_token = '';
const content_file = fs.readFileSync('./French.txt','utf8');
const content_tab = content_file.split("\n");

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

function getRandomWord() {
    return content_tab[getRandomNumber(0, 73451)];
  }

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTI    ONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

/**
 * Get a random french word
 */
app.get('/api/v1/random-word', (req, res) => {
    res.send({word: getRandomWord()});
})

/**
 * Get the list of all french words
 */
app.get('/api/v1/words', (req, res) => {
    res.send({words: content_tab});
})

app.listen(port);