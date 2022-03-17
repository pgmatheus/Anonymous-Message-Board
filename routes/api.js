'use strict';
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI, { useUnifiedTopology: true, useNewUrlParser: true});

let Reply = new mongoose.Schema({
	text: {type: String, required: true},
	delete_password: {type: String, required: true},
	created_on : {type: Date, required: true},
	reported: {type: Boolean, required: true}
})

const Thread = new mongoose.Schema({
  board: String,
  text: String,
  delete_password: String,
  created_on: Date,
  bumped_on: Date,
  reported: Boolean,
  replies: [Reply],
  replycount: Number
});

const thread = mongoose.model('thread', Thread);
const reply = mongoose.model('reply', Reply);

function createElement(col1,arr) {
  let a = '';
  if (col1 == 1){a = new thread(arr);}
  else{a = new reply(arr);}
  a.save(function (err,doc) {
    if (err) return handleError(err);
    return doc
  })
  return a
}

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .post(function(req,res){
      let inp = req.body
      inp['board'] = req.params['board']
      let z = createElement(1,{
        board: inp['board'],
        text: inp['text'],
        delete_password: inp['delete_password'],
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        replies: [],
        replycount:0
      })      
      return res.redirect('/b/' + inp['board'])
    })
    
  .get(function(req,res){
    let inp = req.params['board']

    thread.find({board:inp})
      .limit(10)
      .select('-delete_password')
      .select('-reported')
      .lean()
      .sort({bumped_on: 'desc'})
      .exec((err,doc) => {
        if (err) console.log(err)
        if (doc != undefined){
          for (let i =0;i<doc.length;i++){
            for (let j=0;j<doc[i]['replies'].length;j++){
              doc[i]['replies'][j]['reported'] = undefined
              doc[i]['replies'][j]['delete_password'] = undefined
            }

            if (doc[i]['replies'].length>3){              
              doc[i]['replies'].length = 3
            }     
          }
        
          res.json(doc)            
        }
        else{
          res.json('error')
        }
      
      })

    
  })

  .delete(function(req,res) {
    let inp = req.body;
    inp['board'] = req.params['board']
    thread.find({_id:inp['thread_id']})
    .exec((err,doc) =>{
      if (err) console.log(err)
        if (doc == undefined || doc[0]['delete_password'] != inp['delete_password']){
          res.send('incorrect password')
        }
        else{
          thread.deleteOne({_id:inp['thread_id']})
            .exec((err,doc2) => {
                if (err) console.log(err)
                res.send('success')
              
            })

        }
    })
  })

  .put(function(req,res) {
    let inp = req.body
    inp['board'] = req.params['board']
    thread.findOneAndUpdate({_id:inp['thread_id']},{reported:true})
      .exec((err,doc) =>{
        if (err) console.log(err)
        else{
          res.send('reported')
        }        
      })
  }) 
  
  app.route('/api/replies/:board')
    .post(function(req,res){
        let inp = req.body
        inp['board'] = req.params['board']      

        let newReply = {
          text: inp['text'],
	        delete_password: inp['delete_password'],
	        created_on : new Date(),
	        reported: false
        }          
        // Verify if thread already exists
        thread.find({_id:inp['thread_id']})
          .exec((err,doc) =>{
            if (err) console.log(err)
          })
        thread.findOneAndUpdate({board:inp['board'],_id:inp['thread_id']},
                                {$push:{replies: newReply},$inc:{replycount: 1},  bumped_on: new Date()},{new:true})
          
          .exec((err,doc) => {
            if (err) console.log(err)
            if (doc == undefined){
            res.redirect('/b/'+inp['board']+'/'+inp['thread_id']+ '?new_reply_id='+inp['thread_id'])

            }              
            else{
              res.redirect('/b/'+inp['board']+'/'+inp['thread_id']+ '?new_reply_id='+inp['thread_id'])
            }          
          })
 
      })

  .get(function (req,res) {
    thread.findById(
  		req.query.thread_id,
  		(err, doc) => {
  			if(!err && doc != undefined){
  				doc.delete_password = undefined
          doc.reported = undefined
  				doc.replies.sort((thread1, thread2) => {
  					return - thread2.createdon_ + thread1.createdon_
  				})
          
  				doc.replies.forEach((reply) => {
  					reply.delete_password = undefined
            reply.reported = undefined
  				})


          
  
  				return res.json(doc)
  			}
  		}
  	)    
  })

  .delete(function(req,res) {
    let inp = req.body;
    inp['board'] = req.params['board'];
    thread.find({_id:inp['thread_id']})
      .exec((err,doc) =>{
        if (err) console.log(err)
        if (doc == undefined) {res.json('incorrect password')}
        else{
          let r = doc[0]['replies'].filter(e => {
            return e['_id'] == inp['reply_id']
          })

          if (r[0]['delete_password'] != inp['delete_password']){
            res.send('incorrect password')
          }
          else{
            thread.updateOne(
              {
                _id: inp['thread_id'],
                replies: {$elemMatch:{_id:inp['reply_id']}}      
              },
              {$set: {"replies.$.text":'[deleted]'}}
              ,{new:true}
            )              
            .exec((err,doc) => {
              if (err) console.log(err)
              res.send('success')
            })
          }          
        }      
      })    
  })  

  .put(function(req,res) {
    let inp = req.body
    inp['board'] = req.params['board']
    thread.updateOne(
      {
        _id: inp['thread_id'],
        replies: {$elemMatch:{_id:inp['reply_id']}}      
      },
      {$set: {"replies.$.reported":true}},
      {new:true}
    )              
      .exec((err,doc) => {
       if (err) console.log(err)
       res.send('reported')
       })
  })
};
