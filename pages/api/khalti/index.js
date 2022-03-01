import axios from 'axios';
import nc from 'next-connect';

const handler = nc();
handler.post(async (req, res) => {
  const { token, amount } = req.body;
  let data = { token, amount };
  let config = {
    headers: {
      Authorization: `Key ${process.env.KSK}`,
    },
  };
  axios
    .post('https://khalti.com/api/v2/payment/verify/', data, config)
    .then((response) => {
      res.status(200).send({ response: response.data });
    })
    .catch((error) => {
      res.status(400).send({ error });
    });
});

export default handler;
