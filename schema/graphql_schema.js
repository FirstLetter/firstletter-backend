const makeExecutableSchema = require('graphql-tools').makeExecutableSchema
const GithubUserModel = require('../models/github_user').GithubUserModel

const typeDefs = `
type GithubUser {
    github_username: String
    user_auth_token: String
    is_valid: Boolean
}

type Query {
    githubUser(github_username: String): GithubUser
}
` 

const resolvers = {
    Query: {
        async githubUser(_, {github_username}) {
            const result = await GithubUserModel.findOne({github_username: github_username})
            if(result !== null) {
                await GithubUserModel.updateOne({github_username: github_username}, {github_username: github_username, user_auth_token: "", is_valid: false}).exec()
            }
            return result
        }
    }
}

module.exports = {
    schema : makeExecutableSchema({
        typeDefs,
        resolvers
    })
}