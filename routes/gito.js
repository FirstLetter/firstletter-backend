var express = require('express');
var router = express.Router();
var axios = require('axios')

var mongoose = require('mongoose')
const utils =  require('./utils')
const GithubUserModel = require('../models/github_user').GithubUserModel

const runQuery = utils.runQuery
const parseGithubAuthInfo = utils.parseGithubAuthInfo 
const ACCESS_TOKEN_CONST = utils.ACCESS_TOKEN_CONST

/* GET home page. */

router.get('/', (req, res, next) => {
  res.json({message: "success"})
})

const getUserName = (data) => {
  if(data != null){
    return data.data.viewer.login
  } 
  return null
} 

const updateUserInDatabase = async (username, authToken) => {
  console.log("updating existing user...")
  const result = await GithubUserModel.updateOne(
    {
      github_username: username
    }, 
    {
      github_username: username,
      user_auth_token: authToken,
      is_valid: true
    }
  ).exec()
  // console.log(result)
  return result
}

const addUserToDatabase = async (username, authToken) => {
  console.log("adding new user... ")
  const newUser = await new GithubUserModel(
    {
      github_username: username,
      user_auth_token: authToken
    }
  ).save()
  // console.log(newUser)
  
  return newUser
} 

const processUserInfo = async (data, authToken) => {
  const username = getUserName(data)
  if(username != null){
    const isFound = await GithubUserModel.findOne({ github_username: username }).exec()
    console.log(isFound)
    if(isFound != null) {
      const b = updateUserInDatabase(username, authToken)
      return b
    } else {
      const b = addUserToDatabase(username, authToken)
      return b
    } 
  }
  return false
} 

router.get('/login/callback', async (req, res, next) => {

  console.log("Recieved request..")

  const { query } = req
  const { code } = query

  const response = await axios.post(process.env.BASE_URL, {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: code
  })

  const parsedInfo = parseGithubAuthInfo(response.data)
  console.log(parsedInfo)

  const result = await runQuery(parsedInfo[ACCESS_TOKEN_CONST])
  console.log(result)

  if(result == null || result.data == null) {
    return res.redirect(process.env.REDIRECT_URL_NOT_FOUND)
  }
  const username = getUserName(result.data)
  if(username == null) {
    console.log(`Redirecting to ${process.env.REDIRECT_URL_NOT_FOUND}`)
    return res.redirect(process.env.REDIRECT_URL_NOT_FOUND)
  } else {
    console.log(`Redirecting to ${process.env.REDIRECT_URL_FOUND}`)
    res.redirect([process.env.REDIRECT_URL_FOUND, username].join('/'))
  }
  
  const presult = await processUserInfo(result['data'], parsedInfo[ACCESS_TOKEN_CONST])
  console.log(presult)
});

module.exports = router;
