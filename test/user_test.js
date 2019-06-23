const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../src/server')
const User =  require('../src/models/user')
const should = chai.should()

chai.use(chaiHttp)

describe('User controller test', ()=>{

    it('it should get all users', (done)=>{
        chai.request(server)
            .get('/api/user')
            .end((err,res)=>{
                //console.log(res)
                res.should.have.status(200)
                res.body.should.have.property('payload')
                done()
            })
    }),

    it('it should get one users', (done)=>{
        chai.request(server)
            .get('/api/user?username=harm')
            .end((err,res)=>{
                console.log(res)
                res.should.have.status(200)
                res.body.should.have.property('payload')
                res.body.payload.should.have.property('username').eql('harm')
                res.body.payload.should.have.property('firstname').eql('Harm')
                res.body.payload.should.have.property('lastname').eql('The Waterguy')
                res.body.payload.should.have.property('_id').eql('5d0b491fb65db30017570939')
                done()
            })
    }),

    
})

