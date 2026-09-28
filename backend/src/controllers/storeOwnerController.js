const { fn, col } = require('sequelize');
const { Store, Rating, User } = require('../models');

async function dashboard(req, res) {
  try {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) {
      return res.status(404).json({ message: 'No store is associated with this account' });
    }

    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'address'] }],
      order: [['createdAt', 'DESC']],
    });

    const avgResult = await Rating.findOne({
      where: { storeId: store.id },
      attributes: [[fn('COALESCE', fn('AVG', col('value')), 0), 'avgRating']],
      raw: true,
    });
    const averageRating = Number(parseFloat(avgResult.avgRating).toFixed(2));

    return res.json({
      store: { id: store.id, name: store.name, email: store.email, address: store.address },
      averageRating,
      raters: ratings.map((r) => ({
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        address: r.user.address,
        rating: r.value,
        ratedAt: r.createdAt,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
}

module.exports = { dashboard };
