'use strict';

/**
 * cash service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::cash.cash');
