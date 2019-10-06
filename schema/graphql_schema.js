import {makeExecutableSchema} from 'graphql-tools'
import {GithubUserModel} from '../models/github_user'

const typeDefs = `
type GithubUser {
    github_username: String
    user_auth_token: String
}

type Query {
    githubUser(github_username: String): GithubUser
}
` 

const resolvers = {
    Query: {
        async githubUser(_, {github_username}) {
            const result = await GithubUserModel.findOne({github_username: github_username})
            return result
        }
    }
}

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})