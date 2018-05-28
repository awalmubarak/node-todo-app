const request = require('supertest');
const expect = require('expect');

const {Todo} = require('./../models/todo');
const {app} = require('./../server');

const todos = [{title: 'test todo one'}, {title:'test todo two'}];

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
          Todo.find().then((todos)=>{
            expect(todos.length).toBe(3);
            expect(todos[2].title).toBe(title);
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
        .expect((res)=>expect(res.body.length).toBe(2))
        .end(done());
    });
  });
});
