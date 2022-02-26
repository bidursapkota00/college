import {
  Grid,
  List,
  ListItem,
  Box,
  Typography,
  Divider,
  ListItemText,
} from '@material-ui/core';
import Layout from '../components/Layout';
import db from '../utils/db';
import Product from '../models/Product';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { Store } from '../utils/Store';
import ProductItem from '../components/ProductItem';
import { useState } from 'react';
import { getError } from '../utils/error';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import NextLink from 'next/link';

export default function Home(props) {
  const { enqueueSnackbar } = useSnackbar();
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
    } else {
      axios
        .get('/api/recommend/admin')
        .then(function (response) {
          console.log(response);
          setShowRecommend(JSON.parse(response.data.message));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }, []);
  const [categories, setCategories] = useState([]);
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`/api/products/categories`);
      setCategories(data);
    } catch (err) {
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  return (
    <Layout>
      <div className="home">
        <div className="home__left">
          <List>
            <ListItem>
              <Box padding="10px 0">
                <Typography>Shopping by category</Typography>
              </Box>
            </ListItem>
            <Divider light />
            {categories.map((category) => (
              <NextLink
                key={category}
                href={`/search?category=${category}`}
                passHref
              >
                <ListItem button component="a">
                  <ListItemText primary={category}></ListItemText>
                </ListItem>
              </NextLink>
            ))}
          </List>
        </div>
        <div className="home__right">
          {showRecommend.length ? (
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
          ) : (
            ''
          )}
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
        </div>
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
