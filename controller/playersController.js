const dbConnect = require('../db/conn')
const mongodb = require('mongodb')

module.exports = {
    readData :  async (req,res) => {
        // let data = await dbConnect('teamDetails')
        // data = await data.find().toArray()
        // // data = await data.find({},{name:1}).toArray()
        // res.send(data)

        const db = await dbConnect('teamDetails')
        
        let data = await db.findOne({_id: new mongodb.ObjectId(req.headers.teamid)})
        if(data)
        {
            const subDB = await dbConnect('team'+data.name)
            let playersData  = await subDB.find().toArray()
            res.send(playersData)
        }
        else
        {
            res.send("This team does not exist")
        }
    },
    insertData : async (req, res) => {
        try{
            
            const db = await dbConnect('teamDetails')
            let data = await db.findOne({_id: new mongodb.ObjectId(req.body.teamID)})
            
            if(data)
            {
                const subDB = await dbConnect('team'+data.name)
    
                delete req.body.teamID
                const result = await subDB.insertMany([req.body])
        
                if(result.acknowledged)
                {
                    res.send(result)
                }
            }
            else
            {
                res.send("This team does not exist")
            }
        }catch(e){
            console.log(e)
        }
    },
    updateData : async (req, res) => {
        try{
            const db = await dbConnect('teamDetails')
            let data = await db.findOne({_id: new mongodb.ObjectId(req.body.teamID)})
            if(data)
            {
                const subDB = await dbConnect('team'+data.name)
                delete req.body.teamID

                let result = await subDB.updateOne({_id: new mongodb.ObjectId(req.params.id)} , {$set: req.body})
                res.send(result)
            }
            else
            {
                res.send("This team does not exist")
            }
        }
        catch(e){
            console.log(e)
        }
    },
    deleteData : async (req, res) => {
        const db = await dbConnect('teamDetails')
        
        let data = await db.findOne({_id: new mongodb.ObjectId(req.headers.teamid)})
        if(data)
        {
            const subDB = await dbConnect('team'+data.name)

            let result = await subDB.deleteOne({_id: new mongodb.ObjectId(req.params.id)})
            if(result.acknowledged){
                res.send(result)
            }
        }
        else
        {
            res.send("Data not found")
        }
    },
    getPlayer : async (req, res) => {
        const db = await dbConnect('teamDetails')
        let data = await db.findOne({_id: new mongodb.ObjectId(req.headers.teamid)})
        if(data)
        {
            const subDB = await dbConnect('team'+data.name)
            //age grater than 20 & less than or eq 40 & playerrole is roleOne or roleThree & contry name starts with i - case insensitive
            let result = await subDB.find({
                $and : [{age: {$gt: 20}}, {age: {$lte: 40}}],
                $or : [{playerrole : 'role One'},{playerrole : 'role Three'}],
                country : /^i/i
            
            }).toArray()
            // let result = await subDB.aggregate([
            //     {
            //         $match : {
            //             $and : [{age: {$gt: 20}}, {age: {$lte: 40}}],
            //             $or : [{playerrole : 'role One'},{playerrole : 'role Three'}],
            //             country : /^i/i
            //         }
            //     }
                
            // ]).toArray()
            res.send(result)
        }
        // else
        // {
        //     res.send("Data not found")
        // }
    },
    scheduleMatch : async (req, res) => {
        try{
            const db = await dbConnect('teamDetails')
            let data = await db.find({$or : [ {_id: new mongodb.ObjectId(req.body.firstTeamId)} , {_id: new mongodb.ObjectId(req.body.secondTeamId)} ]}).toArray()

            req.body.date = new Date(req.body.date)

            if(data.length != 2)
            {
                res.send("This team does not exist")
                return
            }

            if(data.length === 2 && (!(data[0].isSchedule || data[1].isSchedule)))
            {
                const subDB = await dbConnect('matchDetails')
                const result = await subDB.insertMany([req.body])

                // console.log(result)
        
                if(result.acknowledged)
                {
                    let result = await db.updateOne({_id: new mongodb.ObjectId(req.body.firstTeamId)},{$set: {isSchedule:1,matchCount: data[0].matchCount + 1 }})
                    let result2 = await db.updateOne({_id: new mongodb.ObjectId(req.body.secondTeamId)},{$set: {isSchedule:1,matchCount: data[1].matchCount + 1 }})
                    
                    // console.log(req.body.players)
                    // for(let i=0; i<req.body.players.length; i++)
                    // {
                    //     let data = await db.findOne({_id: new mongodb.ObjectId(req.body.players[i].teamID)})
                    //     const subDB = await dbConnect('team' + data.name)
                    //     const data2 = await subDB.findOne({_id: new mongodb.ObjectId(req.body.players[i].playerID)})
                    //     console.log(data2.matchIDs)
                    //     const result  = subDB.updateOne({_id: new mongodb.ObjectId(req.body.players[i].playerID)},{$set: {matchIDs : data2.matchIDs.push('2')}})
                    //     console.log(result)
                    // }
                    
                    res.send("Scheduled")

                }
            }
            else
            {
                res.send("Already Scheduled")
            }
        }catch(e){
            console.log(e)
        }
    },
    updateScore : async (req, res) => {
        const db = await dbConnect('teamDetails')
        let data = await db.findOne({_id: new mongodb.ObjectId(req.body.teamID)})

        if(data)
        {
            const subDB = await dbConnect('team'+data.name)
            let playerData = await subDB.findOne({_id: new mongodb.ObjectId(req.body.playerID)})
            let result = await subDB.updateOne({_id: new mongodb.ObjectId(req.body.playerID)} , {$set: {score: playerData.score + req.body.playerScore}})
            let result2 = await db.updateOne({_id: new mongodb.ObjectId(req.body.teamID)} , {$set: {score: data.score + req.body.playerScore}})
            res.send(result2)
        }
        else
            res.send("This team does not exist")
    },
    matchHistory : async (req, res) => {
        
        // const db = await dbConnect('teamDetails')
        // let data = await db.findOne({_id: new mongodb.ObjectId(req.body.teamID)})

        // // console.log(data)
        // const subDB = await dbConnect('team'+ data.name)
        // const allPlayers = await subDB.find().toArray()

        const matchDetails = await dbConnect('matchDetails')
        console.log(req.body.playerID)
        data = await matchDetails.find({players: {$elemMatch: {'playerID':req.body.playerID}}})

        res.send(data)

    }
}