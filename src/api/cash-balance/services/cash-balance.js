'use strict';

/**
 * cash-balance service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::cash-balance.cash-balance');
