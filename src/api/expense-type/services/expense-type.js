'use strict';

/**
 * expense-type service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::expense-type.expense-type');
