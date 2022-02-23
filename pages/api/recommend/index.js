import nc from 'next-connect';
import db from '../../../utils/db';
import Product from '../../../models/Product';
import Order from '../../../models/Order';
import Probability from '../../../models/Probability';
import { recommendFunction } from './admin';

const handler = nc();

handler.get(async (req, res) => {
  await db.connect();
  let prob = await Probability.findOne({});
  prob = prob.probability;
  const user = req.query.id;
  let orders = await Order.find({ user });
  if (!orders.length) {
    const d = await recommendFunction();
    res.send({ message: JSON.stringify(d) });
  }
  let recommendFor = [];
  for (let i = 0; i < orders.length; i++) {
    for (let j = 0; j < orders[i].orderItems.length; j++) {
      recommendFor.push(orders[i].orderItems[j]._id.toString());
    }
  }
  recommendFor = [...new Set(recommendFor)];
  // console.log(recommendFor, prob);
  let recommended = [];
  for (let i = 0; i < recommendFor.length; i++) {
    const key = recommendFor[i];
    const obj = prob[key];
    if (obj) {
      const array = Object.keys(obj);
      recommended = [...recommended, ...array];
    }
  }
  recommended = [...new Set(recommended)];
  // console.log(recommended);
  let products = [];
  if (recommended.length) {
    if (recommended.length <= 3) {
      for (let i = 0; i < recommended.length; i++) {
        let product = await Product.findById(recommended[i]);
        products.push(product);
      }
    } else {
      let usedIndex = [];
      for (let i = 0; i < 3; i++) {
        let index = Math.floor(Math.random() * recommended.length);
        if (usedIndex.indexOf(index) == -1) {
          usedIndex.push(index);
          let product = await Product.findById(recommended[index]);
          products.push(product);
        } else i--;
      }
    }
  }
  // console.log(products);
  await db.disconnect();
  res.send({ message: JSON.stringify(products) });
});

export default handler;
