const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({
    title:          {type: String, required: true},
    description:    {type: String, required: true},
    completed:      {type: Boolean, default: false},
    dueDate:        {type: Date, default: Date.now},
    priority:       {type : String, enum: ['low', 'medium', 'high'], default: 'low'},
    owner:          {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'}


},{
    timestamps: true
});



const Task = mongoose.model('Task', taskSchema);

module.exports = Task;  