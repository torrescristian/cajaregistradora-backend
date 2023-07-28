'use strict';

/**
 * payment-type service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::payment-type.payment-type');
