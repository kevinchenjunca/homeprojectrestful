//App dependency
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
//const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

//callback dependency
const callback = require('./controllers/callback');
const auth = require('./services/authentication');


//DB Setup
mongoose.connect('mongodb://colonial:Wanbo12#@cluster0-shard-00-00-n16iz.mongodb.net:27017,cluster0-shard-00-01-n16iz.mongodb.net:27017,cluster0-shard-00-02-n16iz.mongodb.net:27017/auth?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin');


//App Setup
//app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json({type: '*/*'}));

app.get('/',        auth.jwt,   callback.access);
app.post('/signin', auth.local, callback.signin);
app.post('/signup', callback.signup);
app.get('/activate',auth.jwt,   callback.activate);

//Server Setup
const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log('server listening on: ', port);
