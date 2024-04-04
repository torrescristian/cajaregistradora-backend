// @ts-check
'use strict';

const {
  createControllerKey,
  findPageInStore,
  findOneInStore,
} = require('../../../../libs/utils');

/**
 * table-category controller
 */

const MODEL_KEY = 'table-category';

const CONTROLLER_KEY = createControllerKey(MODEL_KEY);

const { createCoreController } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreController(CONTROLLER_KEY, ({ strapi }) => ({
  async create(ctx) {
    const userId = ctx.state.user.id;

    const results = await strapi.db.query(createControllerKey('store')).findOne({
      where: {
        $or: [
          {
            owner: {
              id: userId,
            },
          },
          {
            employees: [userId],
          },
        ],
      },
    });

    if (!results) {
      return ctx.throw(404, 'Store not found');
    }

    ctx.request.body.data.store = results.id;
    const createdOrder = await super.create(ctx);

    ctx.send(createdOrder);
  },
  async find(ctx) {
    const results = await findPageInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      orderBy: {
        id: 'desc',
      },
    });

    if (!results) {
      return ctx.throw(404, 'Table Category not found');
    }

    ctx.send(results);
  },
  async findOne(ctx) {
    const results = await findOneInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
    });

    if (!results) {
      return ctx.throw(404, 'Table Category not found');
    }

    ctx.send(results);
  },
}));
