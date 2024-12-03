const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoute = require('./routes/userRoute');
const taskroute = require('./routes/taskroute');

require('./db');
require('dotenv').config();
require('./Model/User'); 
const PORT = process.env.PORT || 8000; 






// middleWares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/users', userRoute);
app.use('/tasks', taskroute);



app.get('/', (req, res)=>{
    res.status(200).send('The Task API is working')
});

app.use((req, res) => {
    res.status(404).send({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
});

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});
   
