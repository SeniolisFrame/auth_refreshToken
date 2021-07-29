const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    _id : mongoose.Schema.ObjectId,
    user_id : mongoose.Schema.ObjectId,
    refresh_token : String
},{ versionKey: false }
)

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);