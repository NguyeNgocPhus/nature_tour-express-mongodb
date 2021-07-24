import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51JBiPVLRAvZ4hnee5dqzv9evi27qaqel08F3Cynr2514lgyaksNG5mPeHqlrdPigHqnQr1R33fyUNtL8fEugUMxx00jkvGjy0J'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);
    // console.log(session);
    //console.log(session.data.session.id);
    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
