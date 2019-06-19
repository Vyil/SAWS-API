const mongoose =require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../src/server')
const Stream = require('../src/models/streams')
const should = chai.should()

chai.use(chaiHttp)

describe('Stream controller test',  () =>{
    it('Get streams when there is streams to get ', (done) =>{
        chai.request(server)
        .get('/streamers')
        .end((err,res) =>{
            res.should.have.status(200)
            done()
        })
        })  

    it('Get ViewerCount show how many viewers', (done) =>{
        chai.request(server)
        .get('/viewers')
        .end((err, res) =>{
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('viewers')
            done()
        })


    })
    it('Setup initial Stream, Stream gettin up', (done) =>{

        
        chai.request(server)
        .post('/stream')
        .end((err,res)=> {
            res.should.have(200)
            res.body.be.a('object')
            res.body.should.have.property('date')
            res.body.should.have.property('live').eql('true')
            res.body.should.have.property('uuid')
            res.body.should.have.property('username')
            done()
        })

        })
    it('Close stream, Stream getting closed', (done) =>{

        chai.request(server)
        .put('/stream')
        end((err,res) => {
            res.should.have(200)
        })


    })
    it('Get live streams, All the live streams get up', (done) =>{
        
        chai.request(server)
        .get('/stream/live')
        .end((err,res) =>{
            res.should.have(200)
            res.body
        })
        })
    })