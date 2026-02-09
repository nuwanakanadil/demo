const Apparel = require("./apparel.model");

function badRequest(msg) {
  const err = new Error(msg);
  err.statusCode = 400;
  return err;
}
function notFound(msg) {
  const err = new Error(msg);
  err.statusCode = 404;
  return err;
}
function forbidden(msg) {
  const err = new Error(msg);
  err.statusCode = 403;
  return err;
}

async function create({ userId, data }) {
  if (!data.title || !data.size) throw badRequest("title and size are required.");
  return Apparel.create({ ...data, owner: userId });
}

async function list(query) {
  const {
    search,
    category,
    size,
    condition,
    available,
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  if (category) filter.category = category;
  if (size) filter.size = size;
  if (condition) filter.condition = condition;

  if (available === "true") filter.isAvailable = true;
  if (available === "false") filter.isAvailable = false;

  if (search) filter.$text = { $search: search };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Apparel.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Apparel.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
}

async function getOne(id) {
  const item = await Apparel.findById(id).populate("owner", "name email");
  if (!item) throw notFound("Item not found.");
  return item;
}

async function update({ id, userId, data }) {
  const item = await Apparel.findById(id);
  if (!item) throw notFound("Item not found.");

  if (String(item.owner) !== String(userId)) {
    throw forbidden("You can only update your own item.");
  }

  // Prevent owner manipulation
  delete data.owner;

  Object.assign(item, data);
  await item.save();

  return item;
}

async function remove({ id, userId }) {
  const item = await Apparel.findById(id);
  if (!item) throw notFound("Item not found.");

  if (String(item.owner) !== String(userId)) {
    throw forbidden("You can only delete your own item.");
  }

  await item.deleteOne();
  return true;
}

async function myItems(userId) {
  return Apparel.find({ owner: userId }).sort({ createdAt: -1 });
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  myItems,
};
