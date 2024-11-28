const express = require('express');

const router = express.Router();
const auth = require('../middlewares/auth');
const Task = require('../Model/Task');


router.get('/test', auth, (req, res)=>{
    res.status(201).json({
        message: 'Task Manager Api are working',
        user: req.user
    })
});

// Creating Task
router.post('/createTask', auth, async(req, res)=>{
    try{
        const task = new Task({
            ...req.body,
            owner: req.user._id
        });
        await task.save();
        res.status(201).json({task, message: 'Task Created Successfully'});
        // console.log(task)
    }
    catch(err){
        res.status(409).send({error: err.message});
        console.log(err);
    }
});

router.get('/userTask', auth, async (req, res)=>{
    try{
        const tasks = await Task.find({
            owner: req.user._id
        })
        res.status(200).json({tasks, count: tasks.length, message: 'Task fetched Successfully'});
    }
    catch(err){
        res.status(409).send({error: err.message});
        console.log(err);
    }
})

// Fetching a Specific User Task
router.get('/userTask/:id', auth, async (req, res)=>{
    const userTaskId = req.params.id;
    try{
        const task = await Task.findOne({
            _id: userTaskId,
            owner: req.user._id
        });
        if(!task){
            return res.status(419).json({message: 'Whoosh Task not found'});
        }
        res.status(200).json({task, message: 'Task fetched Successfully'});
    }
    catch(err){
        res.status(409).send({error: err.message});
        console.log(err);
    }
})



// Updating Task
router.patch('/userTask/:id', auth, async (req, res)=>{
    const userTaskId = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidUpdates = updates.every(update => allowedUpdates.includes(update));
    if(!isValidUpdates){
        return res.status(400).json({error: 'Invalid updates!'});
    }
    try{
        const task = await Task.findOne({
            _id: userTaskId,
            owner: req.user._id
        });
        if(!task){
            return res.status(419).json({message: 'Whoosh Task not found'});
        }
        
        updates.forEach(update => task[update] = req.body[update]);
        await task.save()
        res.status(200).json({task, message: 'Task updated Successfully'});
    }
    catch(err){
        res.status(409).send({error: err.message});
        console.log(err);
    }
})
// Deleting Task
router.delete('/userTask/:id', auth, async (req, res)=>{
    const userTaskId = req.params.id;
    
    try{
        const task = await Task.findOneAndDelete({
            _id: userTaskId,
            owner: req.user._id
        });
        if(!task){
            return res.status(419).json({message: 'Whoosh Task not found'});
        }
        res.json({message: 'Task deleted Successfully'});
    }
    catch(err){
        res.status(409).send({error: err.message});
        console.log(err);
    }
})


 
module.exports = router; 