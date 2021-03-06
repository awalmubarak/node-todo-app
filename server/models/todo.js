const mongoose = require('mongoose');

var Todo = mongoose.model('Todo',{
  title:{
    type:String,
    minlength:1,
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
  },
  _creator:{
    required:true,
    type: mongoose.Schema.Types.ObjectId
  }
});

module.exports = {Todo};
