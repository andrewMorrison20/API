
const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv').config({ path: './config.env' });
const userRouter = require('./routes/userRoutes');
const dailylogRouter = require('./routes/dailylogRoutes');
const mysql2 = require('mysql2');

const app = express();

app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', userRouter);
app.use('/dailylog', dailylogRouter);


module.exports = app