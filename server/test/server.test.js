const request = require('supertest');
const expect = require('expect');

const {Todo} = require('./../models/todo');
const {app} = require('./../server');


beforeEach((done)=>{
  Todo.remove({}).then(()=>done());
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
            expect(todos.length).toBe(0);
            done();
          }).catch((e)=>done(e));
        });
    });

  });
});
