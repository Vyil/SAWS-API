const mongoose =require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const User =  require('../models/user')
const should = chai.should()

chai.use(chaiHttp)

describe('User controller test', ()=>{
    it('it should create a user',(done)=>{
        const user = new User({
            username: 'Admin',
            password: 'admin',
            firstname: 'Hanz',
            lastname: 'de Admin'
        })

        chai.request(server)
            .post('/users')
            .send(user)
            .end((err, res)=>{
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('username').eql('Admin')
                res.body.should.have.property('password')
                res.body.should.have.property('firstname').eql('Hanz')
                res.body.should.have.property('lastname').eql('de Admin')
                done()
            })
    })
})

