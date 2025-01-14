import type {StoreCart} from "@medusajs/types";

import {isManual, isStripe, isPayOs} from "../utils";
import ManualPaymentButton from "./manual";
import StripePaymentButton from "./stripe";
import PayOsPaymentButton from "./payos";

type Props = {
  cart: StoreCart;
  disabled?: boolean;
};
export default function PaymentButton({cart, disabled}: Props) {
  const paymentSession = cart.payment_collection?.payment_sessions?.[0];

  const notReady = !cart || !cart.shipping_address || !cart.email || disabled;

  if (isStripe(paymentSession?.provider_id)) {
    return <StripePaymentButton cart={cart} notReady={Boolean(notReady)} />;
  }

  if (isManual(paymentSession?.provider_id)) {
    return <ManualPaymentButton notReady={Boolean(notReady)} />;
  }

  if (isPayOs(paymentSession?.provider_id)) {
    return <PayOsPaymentButton cart={cart} notReady={Boolean(notReady)} />;
  }
}
