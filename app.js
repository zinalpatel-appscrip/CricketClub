const express = require('express')
const playersRouter = require('./router/router')

const app = express()
const port = 3000;

app.use(express.json())

app.use(playersRouter)

app.listen(port, () => {
    console.log(`Connection is at ${port}`);
})