import {placeOrder} from "@/actions/medusa/order";
import {Cta} from "@/components/shared/button";
import { StoreCart } from "@medusajs/types";
import {track} from "@vercel/analytics";
import {useTransition} from "react";

export default function PayOsPaymentButton({notReady}: {notReady: boolean, cart: StoreCart}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      track("checkout-completed");

      placeOrder();
    });
  };

  return (
    <Cta
      disabled={notReady}
      loading={isPending}
      onClick={handleClick}
      size="sm"
      type="submit"
    >
      Hoàn tất đơn hàng
    </Cta>
  );
}
