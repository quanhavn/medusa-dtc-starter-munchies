"use client";

import type {StoreCart} from "@medusajs/types";

import Body from "@/components/shared/typography/body";
import Heading from "@/components/shared/typography/heading";

import PaymentButton from "./payment/button";

export default function Review({
  active,
  cart,
}: {
  active: boolean;
  cart: StoreCart;
}) {
  if (!active) return null;

  return (
    <div className="flex w-full flex-col gap-8 border-t border-accent py-8">
      <Heading desktopSize="xs" font="sans" mobileSize="xs" tag="h6">
        Xác nhận
      </Heading>
      <>
        <Body>
          Vui lòng kiểm tra lại và xác nhận các thông tin trên là chính xác.
          Bếp sẽ liên hệ với bạn ngay sau khi nhận được đơn hàng
        </Body>
        <PaymentButton cart={cart} />
      </>
    </div>
  );
}
