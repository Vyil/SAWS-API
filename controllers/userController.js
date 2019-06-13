const auth = require('../authentication/authentication');
const apiError = require('../models/apiError');
const User = require('../models/user');
const crypto = require('crypto')

module.exports = {

    createNewUser(req,res){
        console.log('CreateNewUser called ')

        var genRandomString = function(length){
            return crypto.randomBytes(Math.ceil(length/2))
                    .toString('hex') /** convert to hexadecimal format */
                    .slice(0,length);   /** return required number of characters */
        };

        var sha256 = function(password, salt){
            var hash = crypto.createHmac('sha256', salt); /** Hashing algorithm sha512 */
            hash.update(password);
            var value = hash.digest('hex');
            return {
                salt:salt,
                passwordHash:value
            };
        };

        function saltHashPassword(userpassword) {
            var salt = genRandomString(16); /** Gives us salt of length 16 */
            var passwordData = sha256(userpassword, salt);
            console.log('UserPassword = '+userpassword);
            console.log('Passwordhash = '+passwordData.passwordHash);
            console.log('nSalt = '+passwordData.salt);
        }

        User.findOne({
            username: req.body.username
        })
        .then(result => {
            if (result) {
                res.status(409).send(new apiError(409, 'Username already exists')).end();
            } else {
                const newUser = new User(req.body, saltHashPassword(req.body.password),{});
                newUser.save()
                    .then(result => {
                        res.status(200).json({
                            message: "Created user: " + result
                        }).end();
                        return;
                    })
                    .catch(err => {
                        res.status(400).send(new apiError(400, 'Error occured: ' + err)).end();
                        return;
                    });
            }
        })
        .catch(err => {
            res.status(409).send(new apiError(409, 'Username already exists: ' + err)).end();
        })

    }
}