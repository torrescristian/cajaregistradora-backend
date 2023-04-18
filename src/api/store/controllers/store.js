// @ts-check
'use strict';

const { createControllerKey } = require('../../../../libs/utils');

/**
 * store controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const MODEL = 'store';
const CONTROLLER = createControllerKey(MODEL);

module.exports = createCoreController(CONTROLLER, ({ strapi }) => ({
  async find(ctx) {
    const store = await strapi.db.query(CONTROLLER).findPage({
      where: {
        owner: ctx.state.user.id,
      },
    });

    if (!store) {
      return ctx.throw(404, 'Store not found');
    }

    ctx.send(store);
  },
  async findOne(ctx) {
    const store = await strapi.db.query(CONTROLLER).findOne({
      where: {
        $and: [
          {
            owner: ctx.state.user.id,
          },
          {
            id: ctx.params.id,
          },
        ],
      },
    });

    if (!store) {
      return ctx.throw(404, 'Store not found');
    }

    ctx.send(store);
  },
}));
