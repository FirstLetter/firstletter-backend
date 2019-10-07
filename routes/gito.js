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
  const result = await GithubUserModel.updateOne(
    {
      github_username: username
    }, 
    {
      github_username: username,
      user_auth_token: authToken
    }
  )
  // console.log(result)
  return result
}

const addUserToDatabase = async (username, authToken) => {
  const newUser = new GithubUserModel(
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
    const isFound = GithubUserModel.findOne({ github_username: username }).exec()
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

  // console.log("Recieved request..")

  const { query } = req
  const { code } = query

  const response = await axios.post(process.env.BASE_URL, {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: code
  })

  const parsedInfo = parseGithubAuthInfo(response.data)
  // console.log(parsedInfo)

  const result = await runQuery(parsedInfo[ACCESS_TOKEN_CONST])
  const username = getUserName(result.data)
  if(username == null) {
    res.redirect(process.env.REDIRECT_URL_NOT_FOUND)
  } else {
    res.redirect([process.env.REDIRECT_URL_FOUND, username].join('/'))
  }
  
  const presult = await processUserInfo(result['data'], parsedInfo[ACCESS_TOKEN_CONST])
  
});

module.exports = router;
