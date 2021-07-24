const Tour = require('../models/tourModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KET);
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const Booking = require('../models/booking');
const User = require("../models/userModel");

module.exports.getCheckoutSession = async (req, res, next) => {
  // 1) get the currently Tour
  const tour = await Tour.findById(req.params.tourId);
  ///public key :   pk_test_51JBiPVLRAvZ4hnee5dqzv9evi27qaqel08F3Cynr2514lgyaksNG5mPeHqlrdPigHqnQr1R33fyUNtL8fEugUMxx00jkvGjy0J
  ///secret key :   sk_test_51JBiPVLRAvZ4hneeEs7PSBrOlGekHHXByP7qIz9avrM0ESAKZPfl6HxOKCgPERyUCVV1Ak0XKLmrUMyqw8TPdtWQ00iX8YreAD
  // 2) Create checkout session
  console.log(req.user.id);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get("host")}/my-tours`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `${req.protocol}://${req.get("host")}/img/tours/${tour.imageCover}`,
        ],
        amount: tour.price * 100,
        currency: "usd",
        quantity: 1,
      },
    ],
  });
  // 3) Create session as response
  res.status(200).json({
    status: "success",
    session,
  });
};

// module.exports.createBooking = async (req, res, next) => {
//   const { tour, user, price } = req.query;

//   if (!tour && !user && !price) return next();

//   const booking = await Booking.create({ tour, user, price });
//   res.redirect(req.originalUrl.split('?')[0]);
// };
async function createBooking(session) {
  const tour = client_reference_id;
  const user = (await User.find({ email: customer_email }))._id;
  const price = session.line_items[0].amount / 100;
  await Booking.create({ tour, user, price });
}
module.exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_SECRET_WEBHOOK
    );
  } catch (error) {
    return res.status(400).send("webhook errror");
  }
  if (event.type === "checkout.session.completed") {
    createBooking(event.data.object);
  }
  res.status(200).json({ received: true });
};
