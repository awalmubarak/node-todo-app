const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

var app = express();

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


app.listen(3000, ()=>console.log('App running on port 3000'));


module.exports = {app};
