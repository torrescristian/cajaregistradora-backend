// @ts-check
'use strict';

const {
  createControllerKey,
  findPageInStore,
  findOneInStore,
} = require('../../../../libs/utils');

/**
 * ticket controller
 */

const MODEL_KEY = 'ticket';

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
      return ctx.throw(404, 'Ticket not found');
    }

    ctx.request.body.data.store = store.id;
    const createdOrder = await super.create(ctx);

    ctx.send(createdOrder);
  },
  async find(ctx) {
    const sales = await findPageInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      populate: ['order', 'order.items.product', 'order.items.product.store'],
      orderBy: {
        id: 'desc',
      },
      storeLocation: 'order.items.product.store'
    });

    if (!sales) {
      return ctx.throw(404, 'Ticket not found');
    }

    ctx.send(sales);
  },
  async findOne(ctx) {
    const sale = await findOneInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      populate: ['order', 'order.product', 'order.product.store'],
    });

    if (!sale) {
      return ctx.throw(404, 'Ticket not found');
    }

    ctx.send(sale);
  },
}));
