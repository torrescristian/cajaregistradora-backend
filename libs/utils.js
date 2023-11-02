// @ts-check
/**
 * @typedef {{
 * strapi: import("strapi").Strapi,
 * key: string,
 * ctx: import("strapi").Context
 * populate?: string[],
 * orderBy?: object,
 * storeLocation?: string,
 * filters?: object,
 * }} IProps
 */
const OWNER = 'owner';
const SELLER = 'seller';

const isStoreOwner = ({ user, store }) => {
  return user.role.type === OWNER && store.owner.id === user.id;
};
module.exports.isStoreOwner = isStoreOwner;

const isStoreEmployee = ({ user, store }) => {
  return user.role.type === SELLER && store.employees.includes(user.id);
};
module.exports.isStoreEmployee = isStoreEmployee;

const createPopulateFromCtx = (ctx) => {
  const query = ctx.query;
  const queryPopulate =
    typeof query.populate === 'string' ? [query.populate] : query.populate;

  return queryPopulate;
};
module.exports.createPopulateFromCtx = createPopulateFromCtx;

const STORE_LOCATIONS = {
  ROOT: 'root',
  STORE: 'store',
  PRODUCT_STORE: 'product.store',
  SALE_ITEMS_PRODUCT_STORE: 'sale_items.product.store',
  ITEMS_PRODUCT_STORE: 'items.product.store',
  ORDER_ITEMS_PRODUCT_STORE: 'order.items.product.store',
};

module.exports.STORE_LOCATIONS = STORE_LOCATIONS;

const getStore = ({ location, user }) => {
  switch (location) {
    case STORE_LOCATIONS.ROOT: {
      return {
        $or: [
          {
            owner: {
              id: user.id,
            },
          },
          {
            employees: [user.id],
          },
        ],
      };
    }
    case STORE_LOCATIONS.STORE: {
      return {
        store: getStore({
          location: STORE_LOCATIONS.ROOT,
          user,
        }),
      };
    }
    case STORE_LOCATIONS.PRODUCT_STORE: {
      return {
        product: getStore({
          location: STORE_LOCATIONS.STORE,
          user,
        }),
      };
    }
    case STORE_LOCATIONS.SALE_ITEMS_PRODUCT_STORE: {
      return {
        sale_items: getStore({
          location: STORE_LOCATIONS.PRODUCT_STORE,
          user,
        }),
      };
    }
    case STORE_LOCATIONS.ITEMS_PRODUCT_STORE: {
      return {
        items: getStore({
          location: STORE_LOCATIONS.PRODUCT_STORE,
          user,
        }),
      };
    }
    case STORE_LOCATIONS.ORDER_ITEMS_PRODUCT_STORE: {
      return {
        order: getStore({
          location: STORE_LOCATIONS.ITEMS_PRODUCT_STORE,
          user,
        }),
      };
    }
    default:
      break;
  }
};
module.exports.getStore = getStore;

/**
 *
 * @param {IProps} props
 * @returns {Promise<any[]>}
 */
module.exports.findPageInStore = async ({
  strapi,
  key,
  ctx,
  populate,
  orderBy,
  storeLocation,
  filters,
}) => {
  const user = ctx.state.user;
  const query = ctx.query;
  const ctxPopulate = createPopulateFromCtx(ctx);

  const queryObj = {
    where: {
      $and: [
        getStore({
          location: storeLocation || STORE_LOCATIONS.STORE,
          user,
        }),
        {
          ...(query.filters || filters || {}),
        },
      ],
    },
    populate: ctxPopulate || populate || [],
    orderBy: query.sort ||
      orderBy || {
        id: 'desc',
      },
    page: Number(query.page) || 1,
    pageSize: Number(query.pageSize) || 100,
  };

  return await strapi.db.query(key).findPage(queryObj);
};

/**
 *
 * @param {IProps} props
 * @returns {Promise<any>}
 */
module.exports.findOneInStore = async ({
  strapi,
  key,
  ctx,
  populate,
  storeLocation,
}) => {
  const user = ctx.state.user;
  const query = ctx.query;
  const queryPopulate =
    typeof query.populate === 'string' ? [query.populate] : query.populate;

  return await strapi.db.query(key).findOne({
    where: {
      $and: [
        {
          id: ctx.params.id,
        },
        getStore({
          location: storeLocation || STORE_LOCATIONS.STORE,
          user,
        }),
        {
          ...query.filters,
        },
      ],
    },
    populate: queryPopulate || populate || [],
  });
};

module.exports.createControllerKey = (collectionName) => {
  return `api::${collectionName}.${collectionName}`;
};

module.exports.delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
