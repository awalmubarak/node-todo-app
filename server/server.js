require('./config/config');
const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req,res)=>{
  new Todo(req.body)
    .save().
    then((doc)=>res.send(doc))
    .catch((e)=>res.status(400).send(e));
});


app.get('/todos', (req, res)=>{
  Todo.find().then((todos)=>{
    res.send({todos});
  }).catch((e)=>res.status(400).send(e));
});


app.get('/todos/:id', (req, res)=>{
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({invalid:true});
  }

  Todo.findById(id).then((todo)=>{
    if (!todo) {
      return res.status(404).send({empty:true});
    }
     res.send({todo});
  }).catch((e)=>res.status(400).send(e));

});


app.delete('/todos/:id', (req, res)=>{
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({invalid:true});
  }

  Todo.findByIdAndRemove(id).then((todo)=>{
    if (!todo) {
      return res.status(404).send({empty:true});
    }
     res.send({todo});
  }).catch((e)=>res.status(400).send(e));

});


app.patch('/todos/:id', (req, res)=>{
  var id = req.params.id;
  var body = _.pick(req.body, ['title','completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({invalid:true});
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  }else{
    body.completedAt = null;
    body.completed = false;
  }

  Todo.findByIdAndUpdate(id,{$set:body}, {new:true}).then((todo)=>{
    if (!todo) {
      return res.status(404).send({empty:true});
    }
     res.send({todo});
  }).catch((e)=>res.status(400).send(e));

});


app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);
    user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      res.header('x-auth', token).send(user);
    }).catch((e) => res.status(400).send(e));
});


app.get('/users/me',authenticate ,(req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(body.email, body.password).then((user)=>{
    return user.generateAuthToken().then((token)=>{
      res.header('x-auth', token).send(user);
    });
  }).catch((e)=>res.status(400).send());
});

app.delete('/users/me/token', authenticate, (req, res)=>{
  req.user.removeToken(req.token).then(()=>{
    res.status(200).send();
  }).catch((e)=>res.status(400).send(e));
});

app.listen(port, ()=>console.log('App running on port '+port));


module.exports = {app};
