//Maksims Kazoha || R00188979
//Here we set everything that we will be using to create a connection with mongo and make a user schema.
const mongoose = require('mongoose')

const bcrypt = require('bcrypt')
//mongo connection using mongoose.
mongoose.connect("mongodb://localhost:27017/users_list",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
})
//here we make a user schema that is provided by mongoose.
const userSchema = mongoose.Schema({
    username:{
        type: String,
        unique: true,
        required: true
    },
    userType:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
})
//here we save the password and incrypt it using bcrypt.
userSchema.pre("save", function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password = bcrypt.hashSync(this.password,10)
    next()
})
//here we use a method to make sure that the user is sending a password and here it gets checked.
userSchema.methods.comparePassword = function(plainText, callback){
    return callback(null, bcrypt.compareSync(plainText, this.password))
}
//we make an exportable model so it can be used some where else.
const userModel = mongoose.model("user", userSchema)

module.exports = userModel