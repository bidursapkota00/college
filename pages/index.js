import { Grid } from '@material-ui/core';
import Layout from '../components/Layout';
import db from '../utils/db';
import Product from '../models/Product';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { Store } from '../utils/Store';
import ProductItem from '../components/ProductItem';
import { useState } from 'react';
import { useEffect } from 'react';

export default function Home(props) {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { products } = props;
  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };

  const [showRecommend, setShowRecommend] = useState([]);
  const { userInfo } = state;
  useEffect(() => {
    if (userInfo) {
      axios
        .get('/api/recommend', {
          params: {
            id: userInfo._id,
          },
        })
        .then(function (response) {
          console.log(response);
          setShowRecommend(JSON.parse(response.data.message));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }, []);
  return (
    <Layout>
      <div>
        <h1>Products</h1>
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item md={4} key={product.name}>
              <ProductItem
                product={product}
                addToCartHandler={addToCartHandler}
              />
            </Grid>
          ))}
        </Grid>
        {showRecommend.length && (
          <div>
            <h1>For You</h1>
            <Grid container spacing={3}>
              {showRecommend.map((product) => (
                <Grid item md={4} key={product.name}>
                  <ProductItem
                    product={product}
                    addToCartHandler={addToCartHandler}
                  />
                </Grid>
              ))}
            </Grid>
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  let products = await Product.find().sort({ updatedAt: -1 });
  products = JSON.parse(JSON.stringify(products));
  await db.disconnect();
  return {
    props: {
      products,
    },
  };
}
