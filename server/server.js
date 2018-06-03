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

app.post('/todos', authenticate, async (req,res)=>{
  try {
    const todo = await new Todo({title: req.body.title, _creator: req.user._id }).save();
    res.send(todo);
  } catch (e) {
    res.status(400).send(e);
  }
});


app.get('/todos',authenticate, async (req, res)=>{
  try {
    const todos = await Todo.find({ _creator: req.user._id });
    res.send({ todos });
  } catch (e) {
    res.status(400).send(e)
  }
});


app.get('/todos/:id',authenticate, async (req, res)=>{
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({invalid:true});
  }
  try {
    const todo = await Todo.findOne({_id: id,_creator: req.user._id});
    if (!todo) {
      return res.status(404).send({ empty: true });
    }
    res.send({ todo });
  } catch (e) {
    res.status(400).send(e)
  }
});


app.delete('/todos/:id', authenticate, async (req, res)=>{
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({invalid:true});
  }
  try {
    const todo = await Todo.findOneAndRemove({ _id: id, _creator: req.user._id});
    if (!todo) {
      return res.status(404).send({ empty: true });
    }
    res.send({ todo });
  } catch (e) {
    res.status(400).send(e)
  }
});


app.patch('/todos/:id',authenticate, async (req, res)=>{
  const id = req.params.id;
  const body = _.pick(req.body, ['title','completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({invalid:true});
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  }else{
    body.completedAt = null;
    body.completed = false;
  }

  try {
    const todo = await Todo.findOneAndUpdate({_id: id, _creator: req.user._id},
                { $set: body }, { new: true });
    if (!todo) {
      return res.status(404).send({ empty: true });
    }
    res.send({ todo });
  } catch (e) {
    res.status(400).send(e)
  }
});


app.post('/users', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
    await user.save();
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e)
  }
});


app.get('/users/me',authenticate ,(req, res) => {
  res.send(req.user);
});

app.post('/users/login', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);    
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send()
  }
});

app.delete('/users/me/token', authenticate, async (req, res)=>{
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();    
  } catch (e) {
    res.status(400).send(e)
  }
});

app.listen(port, ()=>console.log('App running on port '+port));


module.exports = {app};
