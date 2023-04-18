'use strict';

/**
 * stock-per-product service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::stock-per-product.stock-per-product');
