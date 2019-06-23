const mongoose =require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../src/server')
const User =  require('../src/models/user')
const Stream = require('../src/models/streams')
const should = chai.should()

chai.use(chaiHttp)


describe('Stream controller test', ()=>{

    let testStream;
    let payload;
    before(()=>{
        // testStream={
        //     payload:new Stream({
        //         uuid:'ffffffff-b541-da93-ffff-ffffe2768a38'
        //     })            
        // }
        testStream = {
            payload:{
                uuid:'ffffffff-b541-da93-ffff-ffffe2768a38'
            } 
        }
    })

    it('it should start a test-stream',(done)=>{        

        chai.request(server)
            .post('/api/stream')
            .send(testStream)
            .end((err, res)=>{
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('message').eql('Stream created: ')
                done()
            })
    }),
    it('it should stop a test-stream',(done)=>{

        chai.request(server)
            .put('/api/stream')
            .send(testStream)
            .end((err, res)=>{
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('message').eql('Closed stream: ')
                done()
            })
    })

})