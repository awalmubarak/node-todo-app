const mongoose = require('mongoose');

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/TodoApp');

var Todo = mongoose.model('Todo',{
  title:{
    type:String,
    minlength:70,
    required: true,
    trim: true
  },
  completed:{
    type:Boolean,
    default:false
  },
  completedAt:{
    type:Number,
    default:null
  }
});

var User = mongoose.model('User', {
  email:{
    type:String,
    required: true,
    trim: true,
    minlength: 1
  }
});

new User({email: 'awalmubarak4@gmail.com'}).save()
.then((res)=>{
console.log(res);
})
.catch((e)=>{
  console.log(e);
});

// new Todo({
//   title:'another short title',
//  })
//   .save()
//   .then((res)=>{
//   console.log(res);
//     })
//   .catch((e)=>{
//   console.log(e);
// });
