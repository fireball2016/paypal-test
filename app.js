const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

const app = express();
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('index'));
app.post('/pay', (req, res) => {
    paypal.configure({
        'mode': 'sandbox', //sandbox or live
        'client_id': 'AT__26sXvdYsV7ss-FtX29x6FnCGZX4RRMQ7ZMfYFeIgsNAblohm1MWnxvehmNzjOpuS1zCPZEREMX0X',
        'client_secret': 'EMpwHUbn7Mzwc7GNeozCwxXJrOZJOcF4wwvNYmMc_jQ21pmjRk52gTlW-0cbB80UIAW4kuxTL819cWSh'
      });
    
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": 'http://localhost:3000/success' || 'http://process.env.PORT/success',
            "cancel_url": 'http://localhost:3000/cancel' || 'http://process.env.PORT/cancel',
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "15 inch dildo",
                    "sku": "001",
                    "price": "10.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "10.00"
            },
            "description": "Dildo that will rock you to high heaven "
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            for(let i=0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                    console.log(payment.links[i].href);
                }
            }
        }
        console.log(payment);
    });
});

app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "10.00"
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.send('Success!');
      }
  });
  });

app.get('/cancel', (req, res) => res.send('cancelled'));

app.listen(port, () => {
  console.log(`app fired up on port ${port}`);
});

