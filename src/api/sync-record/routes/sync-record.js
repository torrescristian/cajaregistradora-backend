'use strict';

/**
 * sync-record router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::sync-record.sync-record');
