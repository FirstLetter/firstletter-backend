const Axios = require('axios')
const process = require('process')

const GITHUB_BASE_API_URL = 'https://api.github.com/graphql'
const ACCESS_TOKEN_CONST = 'access_token'

const parseGithubAuthInfo = (data) => {
    const res = data.split('&')
    let asObj = {}
  
    res.map(item => {
      const parts = item.split('=')
      asObj[parts[0]] = parts[1]
    })
  
    return asObj
  } 

const schemaQuery = `
    query {
        viewer {
            login
        }
    }
`

const queryGithubSchema = async (authToken) => {
    try{
        const response = await Axios.post(
            GITHUB_BASE_API_URL,
            {
                query: schemaQuery
            },
            {
                headers: { 
                    Authorization: `bearer ${authToken}`
                }
            }) 
        return response
    } catch(err) {
        // console.log(err)
        return null
    }
}

const runQuery = async (authToken) => {
    const result = await queryGithubSchema(authToken)
    return result
}

module.exports = {
    runQuery,
    parseGithubAuthInfo,
    GITHUB_BASE_API_URL,
    ACCESS_TOKEN_CONST
}
