const mongoose =require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server');
const User =  require('../src/models/user');
const Stream = require('../src/models/streams');
const should = chai.should();

chai.use(chaiHttp);


describe('Stream controller test', ()=>{

    let testStream;
    let payload;
    beforeEach(function(done){
        this.timeout(20000);
        // testStream={
        //     payload:new Stream({
        //         uuid:'ffffffff-b541-da93-ffff-ffffe2768a38'
        //     })
        // }
        testStream = {
            payload:{
                uuid:'ffffffff-b541-da93-ffff-ffffe2768a38'
            }
        };
        done()
    });

    it('it should start a test-stream',(done)=>{

        chai.request(server)
            .post('/api/stream')
            .send(testStream)
            .end((err, res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.payload.should.have.property('message');
                done()
            })
    });
});
