import nc from 'next-connect';
import db from '../../../utils/db';
import Product from '../../../models/Product';
import Order from '../../../models/Order';
import Probability from '../../../models/Probability';

const handler = nc();

export const recommendFunction = async () => {
  console.log('Recommendation based on most popular Products');
  let prob = await Probability.findOne({});
  prob = prob.probability;
  let orders = await Order.find({});
  let recommendFor = [];
  for (let i = 0; i < orders.length; i++) {
    for (let j = 0; j < orders[i].orderItems.length; j++) {
      recommendFor.push(orders[i].orderItems[j]._id.toString());
    }
  }
  recommendFor = [...new Set(recommendFor)];
  let quantities = [];
  for (let k = 0; k < recommendFor.length; k++) {
    let quantity = 0;
    for (let i = 0; i < orders.length; i++) {
      for (let j = 0; j < orders[i].orderItems.length; j++) {
        if (recommendFor[k] == orders[i].orderItems[j]._id.toString()) {
          quantity += orders[i].orderItems[j].quantity;
        }
      }
    }
    quantities.push(quantity);
  }

  let selectedIndexElement = [];
  for (let j = 0; j < 3; j++) {
    let max = 0;
    for (let i = 0; i < quantities.length; i++) {
      if (
        quantities[i] > max &&
        quantities[i] != (selectedIndexElement[0] || -1) &&
        quantities[i] != (selectedIndexElement[1] || -1)
      )
        max = quantities[i];
    }
    selectedIndexElement.push(max);
  }

  let selectedIndex = [];
  function getAllIndexes(arr, val) {
    for (let i = 0; i < arr.length; i++)
      if (arr[i] === val) selectedIndex.push(i);
  }
  for (let i = 0; i < selectedIndexElement.length; i++) {
    getAllIndexes(quantities, selectedIndexElement[i]);
  }

  let selectedRecommendFor = selectedIndex.map((i) => recommendFor[i]);

  let recommended = [];
  for (let i = 0; i < selectedRecommendFor.length; i++) {
    const key = selectedRecommendFor[i];
    const obj = prob[key];
    if (obj && Object.keys(obj).length > 0) {
      let array = [];
      Object.keys(obj).map((o) => {
        if (obj[o] >= 0.2) array.push(o);
      });
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
  return products;
};

handler.get(async (req, res) => {
  await db.connect();
  const d = await recommendFunction();
  await db.disconnect();
  res.send({ message: JSON.stringify(d) });
});

export default handler;
