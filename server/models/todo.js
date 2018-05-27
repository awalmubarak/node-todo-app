const mongoose = require('mongoose');

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

module.exports = {Todo};
