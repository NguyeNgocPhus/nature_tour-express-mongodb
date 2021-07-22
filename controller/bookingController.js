const Tour = require('../models/tourModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KET);
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');

module.exports.getCheckoutSession = async (req, res, next) => {
  // 1) get the currently Tour
  const tour = await Tour.findById(req.params.tourId);
  ///public key :   pk_test_51JBiPVLRAvZ4hnee5dqzv9evi27qaqel08F3Cynr2514lgyaksNG5mPeHqlrdPigHqnQr1R33fyUNtL8fEugUMxx00jkvGjy0J
  ///secret key :   sk_test_51JBiPVLRAvZ4hneeEs7PSBrOlGekHHXByP7qIz9avrM0ESAKZPfl6HxOKCgPERyUCVV1Ak0XKLmrUMyqw8TPdtWQ00iX8YreAD
  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/tour-1-1.jpg`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });
  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
};
