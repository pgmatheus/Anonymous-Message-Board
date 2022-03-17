var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
let inp
chai.use(chaiHttp);
 
let t = 'testrp'
let dp = "testwp"
let dr = 'tesso'

suite('Functional Tests', function() {

test("Creating a new thread: POST request to /api/threads/{board}", function (done) {
      chai
        .request(server)
        .post("/api/threads/testpp3")
        .set('content-type','application/json')
        .send({
          text: t, 
          delete_password: dp})
        .end(function(err,res) {
          assert.equal(res.status,200);
          assert.equal(/test/.test(res.redirects[0]),true);     
          done();
        })      
    })


     test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function (done) {
      chai
        .request(server)
        .get("/api/threads/testpp3")
        .end(function(err,res) {

          if (res.body[0] == undefined){
            inp = res.body
          }
          else{
            inp = res.body[0]            
          }
          assert.equal(res.status,200);
          assert.equal(inp.board,'testpp3');
          assert.equal(inp.text,t); 
          done();
        })      
    })

      test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', function (done) {
      chai
        .request(server)
        .delete("/api/threads/testpp3")
        //.set('content-type','application/json')
        .send({
          board:'testpp3',
          thread_id: inp['_id'],
          delete_password: 'test4',
        })
        .end(function(err,res) {
          assert.equal(res.status,200);
          assert.equal(res.text,'incorrect password');
          done();
        })      
    })

    test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', function (done) {
      chai
        .request(server)
        .delete("/api/threads/testpp3")
        //.set('content-type','application/json')
        .send({
          board:'testpa',
          thread_id: inp['_id'],
          delete_password: dp,
        })
        .end(function(err,res) {
          assert.equal(res.status,200);
          assert.equal(res.text,'success');
          done();
        })      
    })
  

    test('Reporting a thread: PUT request to /api/threads/{board}', function (done) {
      chai
        .request(server)
        .put("/api/threads/testpp3")
        //.set('content-type','application/json')
        .send({
          board:'testpp3',
          thread_id: inp['_id']
        })
        .end(function(err,res) {
          assert.equal(res.status,200);
          assert.equal(res.text,'reported');
          done();
        })      
    })
  



    test('Creating a new reply: POST request to /api/replies/{board}', function (done) {
      chai
        .request(server)
        .post('/api/replies/testpp3')
        //.set('content-type','application/json')
        .send({
          board:'testpp3',
          thread_id: inp['_id'],
          text: 'test4',
          delete_password: dr
        })
        .end(function(err,res) {
          assert.equal(res.status,200);
          assert.equal(/test/.test(res.redirects[0]),true); 
          done();
        })      
    })
 
    test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function (done) {
      chai
        .request(server)
        .get('/api/replies/testpp3')
        .query({thread_id: inp['_id']})
        .end(function(err,res) {
          inp['t_id'] = res.body['replies'][0]['_id']
          assert.equal(res.body['_id'],inp['_id']);
          assert.equal(res.body['board'],'test');
          assert.equal(res.body['text'],t);  
          done();
        })      
    })

      test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', function (done) {
      chai
        .request(server)
        .delete('/api/replies/testpp3')
        //.set('content-type','application/json')
        .send({
          board: 'testpp3',
          thread_id: inp['_id'],
          reply_id: inp['t_id'],
          delete_password: 'test4'
        })
        .end(function(err,res) {
          assert.equal(res.status,200);
          assert.equal(res.text,'incorrect password');
          done();
        })      
    })
  
        test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', function (done) {
      chai
        .request(server)
        .delete('/api/replies/testpp3')
        //.set('content-type','application/json')
        .send({
          board: 'testpp3',
          thread_id: inp['_id'],
          reply_id: inp['t_id'],
          delete_password: dr
        })
        .end(function(err,res) {
          assert.equal(res.status,200);
          assert.equal(res.text,'success');
          done();
        })      
    })
  
    test('Reporting a reply: PUT request to /api/replies/{board}', function (done) {
      chai
        .request(server)
        .put('/api/replies/testpp3')
        //.set('content-type','application/json')
        .send({
          board: 'testpp3',
          thread_id: inp['_id'],
          reply_id: inp['t_id']
        })
        .end(function(err,res) {
          assert.equal(res.status,200);
          assert.equal(res.text,'reported');
          done();
        })      
    })


  

});