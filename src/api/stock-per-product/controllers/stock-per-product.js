// @ts-check
'use strict';

const {
  createControllerKey,
  findPageInStore,
  findOneInStore,
  STORE_LOCATIONS,
  getStore,
} = require('../../../../libs/utils');

/**
 * stock-per-product controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const CONTROLLER_KEY = createControllerKey('stock-per-product');

module.exports = createCoreController(CONTROLLER_KEY, ({ strapi }) => ({
  async find(ctx) {
    const stock = await findPageInStore({
      ctx,
      key: CONTROLLER_KEY,
      strapi,
      populate: ['product'],
      storeLocation: STORE_LOCATIONS.PRODUCT_STORE
    })

    if (!stock) {
      return ctx.throw(404, 'Stock not found');
    }

    return ctx.send(stock);
  },
  async findOne(ctx) {
    const stock = await findOneInStore({
      ctx,
      key: CONTROLLER_KEY,
      strapi,
      storeLocation: STORE_LOCATIONS.PRODUCT_STORE
    })

    if (!stock) {
      return ctx.throw(404, 'Stock not found');
    }

    return ctx.send(stock);
  },
  async update(ctx) {
    const user = ctx.state.user;

    const stockPerProduct = await strapi.db.query(CONTROLLER_KEY).findOne({
      where: {
        $and: [
          {
            ...ctx.query.filters,
          },
          {
            id: ctx.params.id,
          },
          getStore({
            location: STORE_LOCATIONS.PRODUCT_STORE,
            user,
          })
        ],
      },
    });

    if (!stockPerProduct) {
      return ctx.throw(404, 'Store not found');
    }

    const updatedStock = await super.update(ctx);

    ctx.send(updatedStock);
  },
}));
