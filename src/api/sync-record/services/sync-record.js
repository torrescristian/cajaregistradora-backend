'use strict';

/**
 * sync-record service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::sync-record.sync-record');
