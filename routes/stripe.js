const express = require("express");
const Stripe = require("stripe");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const StripeOrder = require("../models/StripeOrder"); // Import the StripeOrder model
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_SECRET);

const router = express.Router();

const checkoutSuccessPage = fs.readFileSync(
    path.join(__dirname, 'checkout-success.html')
  );
  
router.get("/checkout-success", (req, res) => {
  res.set("Content-Type", "text/html");
  res.send(checkoutSuccessPage);
});

const checkoutCancel = fs.readFileSync(
    path.join(__dirname, 'cancel.html')
);
  
router.get("/cancel", (req, res) => {
  res.set("Content-Type", "text/html");
  res.send(checkoutCancel);
});


router.post("/create-checkout-session", async (req, res) => {
  const customer = await stripe.customers.create({
    metadata: {
      userId: req.body.userId,
      cart: JSON.stringify(req.body.cartItems),
    },
  });

  const line_items = req.body.cartItems.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          imageUrl: item.image,
          description: item.desc,
          metadata: {
            id: item.id,
          },
        },
        unit_amount: item.price * 100,
      },
      quantity: item.cartQuantity,
    };
  });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
      
    phone_number_collection: {
      enabled: false,
    },
    line_items,
    mode: "payment",
    customer: customer.id,
    success_url: "https://pixelrush-stripe-server.up.railway.app/stripe/checkout-success",
    cancel_url:  "https://pixelrush-stripe-server.up.railway.app/stripe/cancel",
  });

  res.send({ url: session.url });
});

const createOrder = async (customer, data) => {
  const Items = JSON.parse(customer.metadata.cart);

  const products = Items.map((item) => {
    return {
      productId: item.id,
      quantity: item.cartQuantity,
    };
  });

  const newOrder = new StripeOrder({
    orderId: data.payment_intent,
    userId: customer.metadata.userId,
    customerId: data.customer,
    products,
    subtotal: data.amount_subtotal,
    total: data.amount_total,
    paymentStatus: data.payment_status,
  });

  try {
    const savedOrder = await newOrder.save();
    console.log("Processed Order:", savedOrder);
  } catch (err) {
    console.log(err);
  }
};

module.exports = router;
