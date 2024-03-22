// models/StripeOrder.js
const mongoose = require("mongoose");

const stripeOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    userId: { type: String, required: true },
    products: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        imageUrl: { type: String, required: true },
        title: { type: String, required: true }
      }
    ],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentStatus: { type: String, required: true },
    deliveryStatus: { type: String, default: "pending" },
    customerId: { type: String, required: true }, // Add customerId field
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StripeOrder", stripeOrderSchema);
