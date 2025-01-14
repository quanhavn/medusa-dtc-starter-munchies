"use client";

import {Cta, Link} from "@/components/shared/button";
import Body from "@/components/shared/typography/body";
import {convertToLocale} from "@/utils/medusa/money";

import {useCart} from "./cart-context";

export default function CartFooter() {
  const {cart, isUpdating} = useCart();

  const item_total = cart
    ? convertToLocale({
        amount: cart.item_total,
        currency_code: cart.currency_code,
      })
    : null;

  const cartIsEmpty = cart?.items?.length === 0;

  if (cartIsEmpty) return null;

  return (
    <>
      <div className="h-px w-full bg-accent" />
      <div className="flex w-full flex-col justify-between gap-4 p-s">
        <div className="flex w-full justify-between gap-4">
          <div>
            <Body className="font-semibold" font="sans" mobileSize="base">
              Tổng tiền
            </Body>
            <Body font="sans" mobileSize="sm">
              Đã bao gồm thuế
            </Body>
          </div>
          {item_total && (
            <Body font="sans" mobileSize="base">
              {item_total}
            </Body>
          )}
        </div>
        {!cartIsEmpty && !isUpdating ? (
          <Link className="w-full" href="/checkout" size="lg" variant="primary">
            Thanh toán
          </Link>
        ) : (
          <Cta className="w-full" disabled size="lg" variant="primary">
            Thanh toán
          </Cta>
        )}
      </div>
    </>
  );
}
