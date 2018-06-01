const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {app} = require('./../server');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');



beforeEach(populateUsers);
beforeEach(populateTodos);


describe('Server', ()=>{
  var title = "Test todo from test file";

  describe('POST /todos', ()=>{

    it('should save todo', (done)=>{
      request(app)
        .post('/todos')
        .send({title})
        .expect(200)
        .expect((res)=>{
          expect(res.body.title).toBe(title);
        })
        .end((err, res)=>{
          if (err) {
            return done(err);
          }
          Todo.find({title}).then((todos)=>{
            expect(todos.length).toBe(1);
            expect(todos[0].title).toBe(title);
            done();
          }).catch((e)=>done(e));
        });
    });

    it('should not save todo', (done)=>{
      request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res)=>{
          if (err) {
            return done(err);
          }
          Todo.find().then((todos)=>{
            expect(todos.length).toBe(2);
            done();
          }).catch((e)=>done(e));
        });
    });

  });

  describe('GET /todos', ()=>{
    it('should get all todos', (done)=>{
      request(app)
        .get('/todos')
        .expect(200)
        .expect((res)=>expect(res.body.todos.length).toBe(2))
        .end(done);
    });
  });




  describe('GET /todos/:id', ()=>{
    it('should get todo by id', (done)=>{
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res)=>{
          expect(res.body.todo.title).toBe(todos[0].title);
        })
        .end(done);
    });

    it('should return 404 if todo not found', (done)=>{
      request(app)
        .get('/todos/' + new ObjectID().toHexString())
        .expect(404)
        .expect((res)=>{
          expect(res.body.empty).toBe(true);
        })
        .end(done);
    });


    it('should return 404 for non object IDs', (done)=>{
      request(app)
        .get('/todos/123')
        .expect(404)
        .expect((res)=>{
          expect(res.body.invalid).toBe(true);
        })
        .end(done);
    });

  });


  describe('DELETE /todos/:id', ()=>{
    it('should remove a todo by id', (done)=>{
      request(app)
        .delete(`/todos/${todos[1]._id.toHexString()}`)
        .expect(200)
        .expect((res)=>{
          expect(res.body.todo._id).toBe(todos[1]._id.toHexString());

          Todo.findById(res.body.todo._id).then((todo)=>{
            expect(todo).toNotExist();
            done();
          }).catch((e)=>done(e));

        })
        .end((err, res)=>{
          if (err) {
            done(err);
          }
        });
    });


    it('should return 404 if todo not found', (done)=>{
      request(app)
        .delete('/todos/' + new ObjectID().toHexString())
        .expect(404)
        .expect((res)=>{
          expect(res.body.empty).toBe(true);
        })
        .end(done);
    });


    it('should return 404 for non object IDs',(done)=>{
      request(app)
        .delete('/todos/123')
        .expect(404)
        .expect((res)=>{
          expect(res.body.invalid).toBe(true);
        })
        .end(done);
    });

  });


  describe('PATCH /todos/:id', ()=>{
    it('should update todo', (done)=>{
      request(app)
        .patch(`/todos/${todos[0]._id.toHexString()}`)
        .send({title, completed:true})
        .expect(200)
        .expect((res)=>{
          expect(res.body.todo.title).toBe(title);
          expect(res.body.todo.completed).toBe(true);
          expect(res.body.todo.completedAt).toExist();
          expect(res.body.todo.completedAt).toBeA('number');
        })
        .end(done);
    });

    it('should clear completedAt if todo is not completed', (done)=>{
      request(app)
        .patch(`/todos/${todos[1]._id.toHexString()}`)
        .send({completed:false})
        .expect(200)
        .expect((res)=>{
          expect(res.body.todo.title).toBe(todos[1].title);
          expect(res.body.todo.completed).toBe(false);
          expect(res.body.todo.completedAt).toNotExist();
        })
        .end(done);
    });
  });


  describe('GET /users/me', ()=>{
    it('should return user if authenticated', (done)=>{
      request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
          expect(res.body._id).toBe(users[0]._id.toHexString());
          expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
      request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({});
        })
        .end(done);
    });
  });


  describe('POST /users', ()=>{
    var email = 'testin@gmail.com';
    var password = '123123';
    it('should create a user', (done)=>{

      request(app)
        .post('/users')
        .send({ email, password })
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(email);
          expect(res.headers['x-auth']).toExist();
          expect(res.body._id).toExist();
        })
        .end(done);
    });

    it('should return validation errors if request invalid', (done) => {
      request(app)
        .post('/users')
        .send({ email, password:'222' })
        .expect(400)
        .end(done);
    });

    it('should not create user if email in use', (done) => {
      request(app)
        .post('/users')
        .send({ email: users[1].email, password })
        .expect(400)
        .end(done);
    });
  });

  describe('POST /users/login', ()=>{
    it('should login user and return token', (done)=>{
      request(app)
        .post('/users/login')
        .send({email:users[1].email, password:users[1].password})
        .expect(200)
        .expect((res)=>{
          expect(res.headers['x-auth']).toExist();
        })
        .end((err, res)=>{
          if (err){
            return done(err);
          }

          User.findById(users[1]._id).then((user)=>{
            expect(user).toExist();
            expect(user.tokens[0].token).toBe(res.headers['x-auth']);
            expect(user.email).toBe(users[1].email);
            done();
          }).catch((e)=>done(e))
        });
    });

    it('should reject invalid credentials', (done) => {

      request(app)
        .post('/users/login')
        .send({ email: users[1].email, password: 'wrongpass' })
        .expect(400)
        .expect((res) => {
          expect(res.headers['x-auth']).toNotExist();
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          User.findById(users[1]._id).then((user) => {
            expect(user.tokens.length).toBe(0);
            done();
          }).catch((e) => done(e))
        })

    });
  });


  describe('DELETE /users/me/token', ()=>{
    it('should delete token when logged out', (done)=>{
      request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err, res)=>{
          if(err){
            return done(err);
          }

          User.findById(users[0]._id).then((user)=>{
            expect(user).toExist();
            expect(user.tokens.length).toBe(0);
            done();
          }).catch((e)=>done(e));
        })
    });
  });


});
