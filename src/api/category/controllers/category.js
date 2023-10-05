'use strict';

/**
 * category controller
 */

const {
  createControllerKey,
  findPageInStore,
  findOneInStore,
} = require('../../../../libs/utils');

const MODEL_KEY = 'category';

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
      return ctx.throw(404, 'Category not found');
    }

    ctx.request.body.data.store = store.id;
    const createdOrder = await super.create(ctx);

    ctx.send(createdOrder);
  },
  async find(ctx) {
    const categories = await findPageInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      orderBy: {
        id: 'desc',
      },
    });

    if (!categories) {
      return ctx.throw(404, 'Category not found');
    }

    ctx.send(categories);
  },
  async findOne(ctx) {
    const categories = await findOneInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
    });

    if (!categories) {
      return ctx.throw(404, 'Category not found');
    }

    ctx.send(categories);
  },
}));
