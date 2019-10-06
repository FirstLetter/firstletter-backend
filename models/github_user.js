const mongoose = require('mongoose')
const Schema = mongoose.Schema

const githubUserSchema = new Schema({
    github_username: String,
    user_auth_token: String
})

export const GithubUserModel = mongoose.model('GithubUser', githubUserSchema)