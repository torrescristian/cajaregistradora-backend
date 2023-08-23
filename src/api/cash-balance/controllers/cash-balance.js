// @ts-check
'use strict';

const {
  createControllerKey,
} = require('../../../../libs/utils');

/**
 * cash-balance controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const CONTROLLER_KEY = createControllerKey('cash-balance');

module.exports = createCoreController(CONTROLLER_KEY)
