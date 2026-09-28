const { Op, fn, col, literal } = require('sequelize');
const { Store, Rating } = require('../models');

const SORTABLE_FIELDS = ['name', 'address', 'rating'];

async function listStores(req, res) {
  const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (address) where.address = { [Op.iLike]: `%${address}%` };

  const order = SORTABLE_FIELDS.includes(sortBy)
    ? sortBy === 'rating'
      ? [[literal('rating'), sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']]
      : [[sortBy, sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']]
    : [['name', 'ASC']];

  try {
    const stores = await Store.findAll({
      where,
      attributes: {
        include: [[fn('COALESCE', fn('AVG', col('ratings.value')), 0), 'rating']],
      },
      include: [{ model: Rating, as: 'ratings', attributes: [] }],
      group: ['Store.id'],
      order,
      subQuery: false,
    });

    const userRatings = await Rating.findAll({
      where: { userId: req.user.id },
      attributes: ['storeId', 'value'],
      raw: true,
    });
    const ratingMap = new Map(userRatings.map((r) => [r.storeId, r.value]));

    const result = stores.map((store) => {
      const plain = store.toJSON();
      return {
        ...plain,
        rating: Number(parseFloat(plain.rating).toFixed(2)),
        userRating: ratingMap.has(store.id) ? ratingMap.get(store.id) : null,
      };
    });

    return res.json({ stores: result });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch stores', error: err.message });
  }
}

async function submitRating(req, res) {
  const { storeId } = req.params;
  const { value } = req.body;
  try {
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    const [rating, created] = await Rating.findOrCreate({
      where: { userId: req.user.id, storeId },
      defaults: { value },
    });
    if (!created) {
      rating.value = value;
      await rating.save();
    }
    return res.status(created ? 201 : 200).json({ rating });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to submit rating', error: err.message });
  }
}

module.exports = { listStores, submitRating };
