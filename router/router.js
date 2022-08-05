const express = require('express')
const router =  new express.Router()

const playersController = require('../controller/playersController')

router.get('/list', playersController.readData)

router.post('/create', playersController.insertData)

router.put('/update/:id', playersController.updateData)

router.delete('/delete/:id', playersController.deleteData)

router.get('/getplayer', playersController.getPlayer)

router.post('/schedulematch', playersController.scheduleMatch)

router.put('/score', playersController.updateScore)

router.get('/history', playersController.matchHistory)

module.exports = router