const mongoose =require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../src/server')
const User =  require('../src/models/user')
var expect = chai.expect

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
            .post('/register')
            .send(user)
            .end((err, res)=>{
                expect(res).to.have.status(200)
                expect(res).body.be.a('object')
                expect(res).body.have.property('username').eql('Admin')
                expect(res).body.have.property('password')
                expect(res).body.have.property('firstname').eql('Hanz')
                expect(res).body.have.property('lastname').eql('de Admin')
                console.log(err);
                done()
            })
    }),

    it('it should have a hashed password', (done)=>{
        const user = new User({
            username: 'Admin2',
            password: 'admin',
            firstname: 'Hanz',
            lastname: 'de Admin'
        })

        var sha256 = function(password){
            var hash = crypto.createHash('sha256');
            hash.update(password);
            var value = hash.digest('hex');
            return {
                passwordHash:value
            };
        };

        function saltHashPassword(userpassword) {
            const passwordData = sha256(userpassword).passwordHash;
            passwordData.toString();
            return passwordData;
        }

        chai.request(server)
            .post('/register')
            .send(user)
            .end((res,err)=>{
                expect(res).to.have.status(200)
                expect(res).body.have.property('password').eql(saltHashPassword('admin'))
                console.log(err);
                done()
            })
    }),

    it('it should get all users', (done)=>{
        chai.request(server)
            .get('/user')
            .end((res)=>{
                res.should.have.status(200)
                res.body.should.be.a('array')
                done()
            })
    })
})

