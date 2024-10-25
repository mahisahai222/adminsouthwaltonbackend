const mongoose = require('mongoose');

const damageSchema = new mongoose.Schema({

  paymentId: { type: String,required: false, },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bookform', // Ensure this matches your booking model
    required: true,
  },
  transactionId: { type: String, required: true, },
  damage: { type: String, default : false },
   images: [{ type: String }],
   approvedByAdmin: {
    type: String,
    default: false,
    required: false
   }
 });

module.exports = mongoose.model('Damage', damageSchema);
