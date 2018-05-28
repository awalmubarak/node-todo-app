const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

const {Todo} = require('./../models/todo');
const {app} = require('./../server');

const todos = [
  {
    _id: new ObjectID(),
    title: 'test todo one'
  },
 {
   _id: new ObjectID(),
   title:'test todo two',
   completed:true,
   completedAt: 333
 }];

beforeEach((done)=>{
  Todo.remove({}).then(()=>{
    return Todo.insertMany(todos);
  }).then(()=>done());
});


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


});
