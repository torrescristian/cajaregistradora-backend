// @ts-check
'use strict';

const {
  createControllerKey,
  findPageInStore,
  findOneInStore,
} = require('../../../../libs/utils');

/**
 * sale controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const MODEL_KEY = 'sale';

const CONTROLLER_KEY = createControllerKey(MODEL_KEY);

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
      return ctx.throw(404, 'Store not found');
    }

    ctx.request.body.data.store = store.id;
    const createdSale = await super.create(ctx);

    ctx.send(createdSale);
  },
  async find(ctx) {
    const sales = await findPageInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      populate: ['sale_items', 'sale_items.product', 'sale_items.product.store'],
      orderBy: {
        id: 'desc',
      },
      storeLocation: 'sale_items.product.store'
    });

    if (!sales) {
      return ctx.throw(404, 'Sales not found');
    }

    ctx.send(sales);
  },
  async findOne(ctx) {
    const sale = await findOneInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      populate: ['sale_items', 'sale_items.product', 'sale_items.product.store'],
    });

    if (!sale) {
      return ctx.throw(404, 'Sale not found');
    }

    ctx.send(sale);
  },
}));
