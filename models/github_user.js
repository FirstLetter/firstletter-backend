const mongoose = require('mongoose')
const Schema = mongoose.Schema

const githubUserSchema = new Schema({
    github_username: String,
    user_auth_token: String,
    is_valid: Boolean
})

module.exports = {
    GithubUserModel: mongoose.model('GithubUser', githubUserSchema)
}