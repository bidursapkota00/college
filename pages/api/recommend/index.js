import nc from 'next-connect';
import db from '../../../utils/db';
import Product from '../../../models/Product';
import Order from '../../../models/Order';
import Probability from '../../../models/Probability';

const handler = nc();

handler.get(async (req, res) => {
  await db.connect();
  let prob = await Probability.findOne({});
  prob = prob.probability;
  const { recommendFor } = JSON.parse(JSON.stringify(req.body));
  //   console.log(recommendFor, prob);
  let recommended = [];
  for (let i = 0; i < recommendFor.length; i++) {
    const key = recommendFor[i];
    const obj = prob[key];
    const array = Object.keys(obj);
    recommended = [...recommended, ...array];
  }
  console.log(recommended);
  let products = [];
  const product = await Product.findById(recommended[0]);
  console.log(product);
  await db.disconnect();
  res.send({ message: 'Get successfully' });
});

export default handler;
