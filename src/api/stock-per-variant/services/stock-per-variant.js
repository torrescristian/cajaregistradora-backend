'use strict';

/**
 * stock-per-variant service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::stock-per-variant.stock-per-variant');
