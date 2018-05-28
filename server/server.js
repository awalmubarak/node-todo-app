const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

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


app.listen(port, ()=>console.log('App running on port '+port));


module.exports = {app};
