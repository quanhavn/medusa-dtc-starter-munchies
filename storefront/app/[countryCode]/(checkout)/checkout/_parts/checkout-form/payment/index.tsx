"use client";
import type { StoreCart, StorePaymentProvider } from "@medusajs/types";
import type { StripeCardElementOptions } from "@stripe/stripe-js";

import {placeOrder} from "@/actions/medusa/order";
import { initiatePaymentSession } from "@/actions/medusa/order";
import { Cta } from "@/components/shared/button";
import Body from "@/components/shared/typography/body";
import Heading from "@/components/shared/typography/heading";
import { useResetableActionState } from "@/hooks/use-resetable-action-state";
import { usePayOS } from "@payos/payos-checkout";
import { Indicator, Item, Root } from "@radix-ui/react-radio-group";
import { CardElement } from "@stripe/react-stripe-js";
import {
    type Dispatch,
    type SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState,
    useTransition,
} from "react";

// import PaymentButton from "./button";
import { isManual, isPayOs, isStripe as isStripeFunc } from "./utils";
import { StripeContext } from "./wrapper";

export default function Payment({
  active,
  cart,
  methods,
  setStep,
}: {
  active: boolean;
  cart: StoreCart;
  methods: StorePaymentProvider[];
  setStep: Dispatch<
    SetStateAction<"addresses" | "delivery" | "payment" | "payos" | "review">
  >;
}) {
  const [error, setError] = useState<null | string>(null);
  const [, setCardComplete] = useState(false); 
  const [isOpen, setIsOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isShowModalErrorPaymentChecking, setIsShowModalErrorPaymentChecking] = useState(false);

  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending",
  );

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? methods[0].id,
  );

  const [, resetTransition] = useTransition();

  const isStripe = isStripeFunc(selectedPaymentMethod);
  const stripeReady = useContext(StripeContext);

  const [{status}, action, , reset] = useResetableActionState(
    initiatePaymentSession,
    {
      error: null,
      status: "idle",
    },
  );
  const [pending, startTransition] = useTransition();
  const [payOSConfig, setPayOSConfig] = useState({
    CHECKOUT_URL: "",
    ELEMENT_ID: "embedded-payment-container",
    RETURN_URL: process.env.NEXT_PUBLIC_CHECKOUT_URL, 
    embedded: true,
    onSuccess: async () => {
      setIsPlacingOrder(true);
      try {
        await placeOrder();
      } finally {
        setIsPlacingOrder(false);
      }
    },
  });

  const paymentContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPayOSConfig(prev => ({
      ...prev,
      CHECKOUT_URL: "",
    }));
    setIsOpen(false);
  }, [selectedPaymentMethod]);

  // Handle PayOS session
  useEffect(() => {
    if (status === "success" && isPayOs(selectedPaymentMethod)) {
      const payOsSession = activeSession;
      
      if (payOsSession?.data?.payOSCheckoutData) {
        const checkoutData = payOsSession.data.payOSCheckoutData as { checkoutUrl: string };
        // Only update if we have a new URL
        if (checkoutData.checkoutUrl && checkoutData.checkoutUrl !== payOSConfig.CHECKOUT_URL) {
          setPayOSConfig((oldConfig) => ({
            ...oldConfig,
            CHECKOUT_URL: checkoutData.checkoutUrl,
          }));
          setIsOpen(true);
        }
      }
    }
  }, [status, selectedPaymentMethod, activeSession]);
  // Only call usePayOS when CHECKOUT_URL is available
  const { open } = usePayOS({
    ...payOSConfig,
    RETURN_URL: payOSConfig.RETURN_URL || '' // Provide default empty string
  });

  function initiatePayment() {
    startTransition(async () => {
      await action({
        cart,
        data: {
          context: {},
          provider_id: selectedPaymentMethod,
        },
      });
    });
  }

  useEffect(() => {
    if (status === "success") {
      if (isManual(selectedPaymentMethod)) {
        setStep("review");
        resetTransition(() => reset());
      } else if (isPayOs(selectedPaymentMethod)) {
        const payOsSession = activeSession;
        
        if (payOsSession?.data?.payOSCheckoutData) {
          const checkoutData = payOsSession.data.payOSCheckoutData as { checkoutUrl: string };

          console.log(`checkoutData.checkoutUrl: ${checkoutData.checkoutUrl}`)
          console.log(`payOSConfig.CHECKOUT_URL: ${payOSConfig.CHECKOUT_URL}`)
          if (payOSConfig.CHECKOUT_URL !== checkoutData.checkoutUrl) {
            setPayOSConfig((oldConfig) => ({
              ...oldConfig,
              CHECKOUT_URL: checkoutData.checkoutUrl,
            }));
            setIsOpen(true);
          }
        }
      }
    }
  }, [status, setStep, reset, selectedPaymentMethod, activeSession]);

  useEffect(() => {
    if (payOSConfig.CHECKOUT_URL && isOpen) {
      open();
    }
  }, [payOSConfig.CHECKOUT_URL, isOpen]);

  useEffect(() => {
    if (isOpen && paymentContainerRef.current) {
      paymentContainerRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [isOpen]);

  const activeMethod = methods.find(
    ({id}) => id === activeSession?.provider_id,
  );
  const isFilled = !!activeMethod && !active;

  const method = getMethodInfo(activeMethod?.id);

  return (
    <div className="flex w-full flex-col gap-8 border-t border-accent py-8">
      <div className="flex items-center justify-between">
        <Heading desktopSize="xs" font="sans" mobileSize="xs" tag="h6">
          Chọn phương thức thanh toán
        </Heading>
        {isFilled && (
          <Cta onClick={() => setStep("payment")} size="sm" variant="outline">
            Chỉnh sửa
          </Cta>
        )}
      </div>
      {isFilled && (
        <div className="flex flex-1 flex-col gap-4">
          {/* <Body className="font-semibold" font="sans">
            Phương thức thanh toán
          </Body> */}
          <Body font="sans">{method.name}</Body>
        </div>
      )}
      {active && (
        <Root
          className="flex w-full flex-col gap-4"
          defaultValue={selectedPaymentMethod}
          name="shippingMethodId"
          onValueChange={(v) => setSelectedPaymentMethod(v)}
        >
          {methods.map((item) => {
            return (
              <Item
              className="flex w-full items-center justify-between gap-[10px] rounded-lg border-[1.5px] border-accent px-[32px] py-[19px] data-[state=checked]:bg-accent data-[state=checked]:text-background"
              key={item.id}
              value={item.id}
            >
              <div className="size-4 rounded-full border border-accent">
                <Indicator id={item.id}>
                  <div className="size-4 rounded-full border-[4px] border-background" />
                </Indicator>
              </div>
              <div className="flex w-full items-center justify-between">
                <Body font="sans">{getMethodInfo(item.id).name}</Body>
              </div>
            </Item>
            );
          })}
          {isPayOs(selectedPaymentMethod) && isOpen && (
            <>
              <div className="w-full">
                <div className="mb-4 text-sm">
                  VUI LÒNG KHÔNG ĐÓNG TRÌNH DUYỆT HOẶC CHUYỂN SANG TRANG KHÁC
                </div>
                <div className="mb-4 text-sm">
                  Sau khi thực hiện thanh toán thành công, vui lòng đợi từ 5 - 10s để
                  hệ thống tự động cập nhật.
                </div>
                <button
                  onClick={async () => {
                    setIsPlacingOrder(true);
                    try {
                      const result:any = await placeOrder();
                      console.log(result.payment_collection.payment_sessions[0].status);
                      if (result.payment_collection.payment_sessions[0].status != "captured") {
                        setIsShowModalErrorPaymentChecking(true);
                      }
                    } finally {
                      setIsPlacingOrder(false);
                    }
                  }}
                  className="w-full rounded-md bg-accent py-2 text-sm text-background hover:opacity-90"
                >
                  Nếu không tự cập nhập, vui lòng ấn vào đây
                </button>
              </div>
              <div
                className="h-[400px]"
                id="embedded-payment-container"
                ref={paymentContainerRef}
              />
            </>
          )}
          {isStripe && stripeReady && (
            <div className="mt-5 flex flex-col gap-2 transition-all duration-150 ease-in-out">
              <Body font="sans">Enter your card details:</Body>

              <CardElement
                onChange={(e) => {
                  setError(e.error?.message || null);
                  setCardComplete(e.complete);
                }}
                options={stripeCardElementOptions}
              />
              {error && <Body font="sans">{error}</Body>}
            </div>
          )}

          {!isOpen && (
            <Cta
              loading={pending}
              onClick={initiatePayment}
              size="sm"
              type="submit"
            >
              {isStripe ? "Add card details" : "Tiếp tục"}
            </Cta>
          )}
        </Root>
      )}
      {isPlacingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
            <p className="text-sm">Đang xử lý đơn hàng...</p>
          </div>
        </div>
      )}
      {isShowModalErrorPaymentChecking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6">
            <p className="text-sm">Đơn hàng chưa được thanh toán. Vui lòng thử lại sau hoặc liên hệ với shop</p>
            <button 
              onClick={() => setIsShowModalErrorPaymentChecking(false)}
              className="mt-4 rounded-md bg-accent px-4 py-2 text-sm text-background hover:opacity-90"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const stripeCardElementOptions: StripeCardElementOptions = {
  classes: {
    base: "pt-3 pb-1 block w-full h-11 px-4 text-accent mt-0 bg-background border-2 rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-accent transition-all duration-300 ease-in-out",
  },
  style: {
    base: {
      "::placeholder": {
        color: "rgb(107 114 128)",
      },
      color: "#424270",
      fontFamily: "Inter, sans-serif",
    },
  },
};

function getMethodInfo(id?: string) {
  switch (id) {
    case "pp_payos_payos":
      return {
        id,
        name: "Chuyển khoản",
      };
    case "pp_system_default":
      return {
        id,
        name: "Thanh toán khi nhận hàng",
      };
    // case "pp_stripe_stripe":
    //   return {
    //     id,
    //     name: "Stripe",
    //   };
    default:
      return {
        id,
        name: "Thanh toán khi nhận hàng",
      };
  }
}
