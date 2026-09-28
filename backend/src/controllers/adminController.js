const bcrypt = require('bcryptjs');
const { Op, fn, col, literal } = require('sequelize');
const { User, Store, Rating, sequelize } = require('../models');

const SORTABLE_USER_FIELDS = ['name', 'email', 'address', 'role', 'createdAt'];
const SORTABLE_STORE_FIELDS = ['name', 'email', 'address', 'createdAt', 'rating'];

async function dashboard(req, res) {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.count(),
      Store.count(),
      Rating.count(),
    ]);
    return res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
}

async function createUser(req, res) {
  const { name, email, password, address, role } = req.body;
  const finalRole = ['ADMIN', 'USER', 'STORE_OWNER'].includes(role) ? role : 'USER';
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, address, role: finalRole });
    return res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
}

async function createStore(req, res) {
  const { name, email, address, ownerId } = req.body;
  try {
    const existing = await Store.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'A store with this email already exists' });
    }
    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (!owner) {
        return res.status(400).json({ message: 'Owner user not found' });
      }
      if (owner.role !== 'STORE_OWNER') {
        owner.role = 'STORE_OWNER';
        await owner.save();
      }
    }
    const store = await Store.create({ name, email, address, ownerId: ownerId || null });
    return res.status(201).json({ store });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create store', error: err.message });
  }
}

async function listStores(req, res) {
  const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (email) where.email = { [Op.iLike]: `%${email}%` };
  if (address) where.address = { [Op.iLike]: `%${address}%` };

  const order = SORTABLE_STORE_FIELDS.includes(sortBy)
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
    return res.json({ stores });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch stores', error: err.message });
  }
}

async function listUsers(req, res) {
  const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (email) where.email = { [Op.iLike]: `%${email}%` };
  if (address) where.address = { [Op.iLike]: `%${address}%` };
  if (role) where.role = role;

  const order = SORTABLE_USER_FIELDS.includes(sortBy)
    ? [[sortBy, sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']]
    : [['name', 'ASC']];

  try {
    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
      order,
    });
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
}

async function getUserDetails(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    let rating = null;
    if (user.role === 'STORE_OWNER') {
      const store = await Store.findOne({ where: { ownerId: user.id } });
      if (store) {
        const result = await Rating.findOne({
          where: { storeId: store.id },
          attributes: [[fn('COALESCE', fn('AVG', col('value')), 0), 'avgRating']],
          raw: true,
        });
        rating = Number(parseFloat(result.avgRating).toFixed(2));
      }
    }
    return res.json({ user, rating });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
}

module.exports = { dashboard, createUser, createStore, listStores, listUsers, getUserDetails };
