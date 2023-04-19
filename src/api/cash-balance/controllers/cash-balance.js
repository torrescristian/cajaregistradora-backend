// @ts-check
'use strict';

const {
  createControllerKey,
  findPageInStore,
} = require('../../../../libs/utils');

/**
 * cash-balance controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const CONTROLLER_KEY = createControllerKey('cash-balance');

module.exports = createCoreController(CONTROLLER_KEY, ({ strapi }) => ({
  async find(ctx) {
    const cashBalances = await findPageInStore({
      ctx,
      key: CONTROLLER_KEY,
      strapi,
      storeLocation: 'store',
      populate: ['products_sold', 'products_sold.product'],
    });

    if (!cashBalances) {
      return ctx.notFound();
    }

    ctx.send(cashBalances);
  },
  async create(ctx) {
    const storePage = await findPageInStore({
      ctx,
      key: createControllerKey('store'),
      strapi,
      storeLocation: 'root',
    });

    const [store] = storePage.results;

    const lastCashBalancePage = await findPageInStore({
      ctx,
      key: CONTROLLER_KEY,
      strapi,
      storeLocation: 'store',
      orderBy: {
        id: 'desc',
      },
      populate: ['products_sold', 'products_sold.product'],
    });

    const [lastCashBalance] = lastCashBalancePage.results;

    const salesPage = await findPageInStore({
      ctx,
      key: createControllerKey('sale'),
      strapi,
      storeLocation: 'sale_items.product.store',
      populate: [
        'sale_items',
        'sale_items.product',
        'sale_items.product.store',
      ],
      orderBy: {
        id: 'desc',
      },
      limit: 1000000,
      filters: lastCashBalance
        ? {
            id: {
              $gt: lastCashBalance.id,
            },
          }
        : {},
    });
    const sales = salesPage.results;

    if (sales.length === 0) {
      ctx.send({
        id: 0,
        total_amount: 0,
        products_sold: [],
      });
      return;
    }

    ctx.request.body.data.store = store.id;
    ctx.request.body.data.total_amount = sales.reduce((acc, sale) => {
      return (
        acc +
        sale.sale_items.reduce((acc, saleItem) => {
          return acc + saleItem.product.price * saleItem.quantity;
        }, 0)
      );
    }, 0);
    const productsById = sales.reduce((acc, sale) => {
      sale.sale_items.forEach((saleItem) => {
        if (acc[saleItem.product.id]) {
          acc[saleItem.product.id] += saleItem.quantity;
        } else {
          acc[saleItem.product.id] = saleItem.quantity;
        }
      });
      return acc;
    }, {});

    ctx.request.body.data.products_sold = Object.keys(productsById).map(
      (productId) => {
        return {
          product: Number(productId),
          quantity: productsById[productId],
        };
      }
    );

    ctx.request.body.data.lastSaleId = sales.reduce((acc, sale) => {
      return sale.id > acc ? sale.id : acc;
    }, 0);

    const cashBalance = await super.create(ctx);

    ctx.send(cashBalance);
  },
}));
