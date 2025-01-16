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
          Bằng cách nhấn Hoàn tất đơn hàng, bạn xác nhận rằng bạn đã
          đọc, hiểu và chấp nhận điều khoản Bán hàng và
          Chính sách Đổi trả của chúng mình - Bếp nhà Sun.
        </Body>
        <PaymentButton cart={cart} />
      </>
    </div>
  );
}
