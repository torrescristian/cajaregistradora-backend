// @ts-check
'use strict';

const {
  createControllerKey,
  findPageInStore,
  findOneInStore,
} = require('../../../../libs/utils');

/**
 * expense controller
*/

const MODEL_KEY = 'expense';

const CONTROLLER_KEY = createControllerKey(MODEL_KEY);

const { createCoreController } = require('@strapi/strapi').factories;

// @ts-ignore
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
    const created = await super.create(ctx);

    ctx.send(created);
  },
  async find(ctx) {
    const res = await findPageInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      orderBy: {
        id: 'desc',
      },
    });

    if (!res) {
      return ctx.throw(404, 'Expense not found');
    }

    ctx.send(res);
  },
  async findOne(ctx) {
    const res = await findOneInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
    });

    if (!res) {
      return ctx.throw(404, 'Expense not found');
    }

    ctx.send(res);
  },
}));
