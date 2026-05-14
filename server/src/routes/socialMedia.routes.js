const express = require('express')
const {
  getSocialMedia,
  createSocialMedia,
  updateSocialMedia,
  deleteSocialMedia,
} = require('../controller/socialMedia.controller')

const socialMediaRouter = express.Router()

socialMediaRouter.get('/', getSocialMedia)
socialMediaRouter.post('/', createSocialMedia)
socialMediaRouter.put('/:id', updateSocialMedia)
socialMediaRouter.delete('/:id', deleteSocialMedia)

module.exports = {
  socialMediaRouter,
}
