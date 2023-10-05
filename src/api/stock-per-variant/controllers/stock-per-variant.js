'use strict';

/**
 * stock-per-variant controller
 */

const {
  createControllerKey,
  findPageInStore,
  findOneInStore,
} = require('../../../../libs/utils');

const MODEL_KEY = 'stock-per-variant';

const CONTROLLER_KEY = createControllerKey(MODEL_KEY);

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(CONTROLLER_KEY, ({ strapi }) => ({
  async create(ctx) {
    const userId = ctx.state.user.id;

    const store = await strapi.db.query(createControllerKey('store')).findOne({
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

    if (!store) {
      return ctx.throw(404, 'Stock per variant not found');
    }

    ctx.request.body.data.store = store.id;
    const created = await super.create(ctx);

    ctx.send(created);
  },
  async find(ctx) {
    const stockPerVariants = await findPageInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      orderBy: {
        id: 'desc',
      },
    });

    if (!stockPerVariants) {
      return ctx.throw(404, 'Stock per variant not found');
    }

    ctx.send(stockPerVariants);
  },
  async findOne(ctx) {
    const stockPerVariants = await findOneInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
    });

    if (!stockPerVariants) {
      return ctx.throw(404, 'Stock per variant not found');
    }

    ctx.send(stockPerVariants);
  },
}));
