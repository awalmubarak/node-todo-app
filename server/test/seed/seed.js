const { ObjectID } = require('mongodb');
const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');
const jwt = require('jsonwebtoken');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();

const todos = [
    {
        _id: new ObjectID(),
        title: 'test todo one',
        _creator: userOneID
    },
    {
        _id: new ObjectID(),
        title: 'test todo two',
        completed: true,
        completedAt: 333,
        _creator:userTwoID
    }
];

const users = [
    {
        email:'awal@gmail.com',
        _id:userOneID, 
        password: 'pass1234',
        tokens:[
            {
                access: 'auth',
                token: jwt.sign({ _id: userOneID, access: 'auth' }, process.env.JWT_SECRET).toString()
            }
        ]
    },
    {
        _id:userTwoID,
        email:'second@gmail.com',
        password: 'pass22221',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({ _id: userTwoID, access: 'auth' }, process.env.JWT_SECRET).toString()
            }
        ]
    }
]

var populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
};

var populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};


module.exports = {todos, populateTodos, users, populateUsers};