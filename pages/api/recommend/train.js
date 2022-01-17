import nc from 'next-connect';
import db from '../../../utils/db';
import Product from '../../../models/Product';
import Order from '../../../models/Order';

const handler = nc();

handler.get(async (req, res) => {
  await db.connect();
  const products = await Product.find({});
  const orders = await Order.find({});
  const orderItems = orders.map((o) => o.orderItems);
  //   products.forEach((p) => console.log(p._id));
  //   console.log('Now orders');
  //   orders.map((order) => {
  //     order.orderItems.map((o) => console.log(o._id));
  //   });
  let prob = {};
  console.log('aalu traning');

  for (let i = 0; i < products.length; i++) {
    let total = 0;
    let success = 0;
    for (let j = 0; j < orderItems.length; j++) {
      const ord = orderItems[j];
      for (let k = 0; k < ord.length; k++) {
        if (products[i]._id.toString() == ord[k]._id.toString()) {
          total = total + 1;
        }
      }
    }
    for (let l = 0; l < products.length; l++) {
      if (products[i]._id.toString() == products[l]._id.toString()) continue;
      for (let j = 0; j < orderItems.length; j++) {
        const ord = orderItems[j];
        let match = 'false';
        for (let k = 0; k < ord.length; k++) {
          if (products[i]._id.toString() == ord[k]._id.toString())
            match = 'semi';
        }
        if (match == 'semi') {
          for (let k = 0; k < ord.length; k++) {
            if (products[l]._id.toString() == ord[k]._id.toString())
              match = 'true';
          }
        }
        if (match == 'true') success += 1;
      }
      if (success != 0) {
        console.log(success / total);
        let key1 = products[i]._id.toString();
        let key2 = products[l]._id.toString();
        const obj = {};
        obj[key2] = success / total;
        prob[key1] = { ...prob[key1], ...obj };
        success = 0;
      }
    }
    console.log(prob);
    // break;
  }
  await db.disconnect();
  res.send({ message: 'Trained successfully' });
});

export default handler;
