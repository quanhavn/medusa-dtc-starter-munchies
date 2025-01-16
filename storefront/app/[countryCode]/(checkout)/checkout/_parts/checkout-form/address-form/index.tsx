"use client";
import type {StoreCart, StoreCartAddress} from "@medusajs/types";
// import type {BaseRegionCountry} from "@medusajs/types/dist/http/region/common";
import type {Dispatch, SetStateAction} from "react";

import {setCheckoutAddresses} from "@/actions/medusa/order";
import {Cta} from "@/components/shared/button";
// import Checkbox from "@/components/shared/checkbox";
import Input from "@/components/shared/input";
// import InputCombobox from "@/components/shared/input-combobox";
import Body from "@/components/shared/typography/body";
import Heading from "@/components/shared/typography/heading";
import {useResetableActionState} from "@/hooks/use-resetable-action-state";
import {useEffect, useTransition} from "react";
import {useFormStatus} from "react-dom";

export default function AddressForm({
  active,
  cart,
  nextStep,
  setStep,
  // setCart, // Add this prop
}: {
  active: boolean;
  cart: StoreCart;
  nextStep: "addresses" | "delivery" | "payment" | "payos" | "review";
  setStep: Dispatch<
    SetStateAction<"addresses" | "delivery" | "payment" | "payos" | "review">
  >;
  // setCart: (cart: StoreCart) => void; // Add this type
}) {
  // const [checked, setChecked] = useState(true);
  const [, startTransition] = useTransition();

  const [{status}, action, , reset] = useResetableActionState(
    setCheckoutAddresses,
    {
      error: null,
      status: "idle",
    },
  );

  // async (state: any, formData: FormData) => {
  //   const result = await setCheckoutAddresses(state, formData);
  //   if (result.status === "success" && result.cart) {
  //     setCart(result.cart);
  //   }
  //   return result;
  // },

  useEffect(() => {
    if (status === "success") {
      setStep(nextStep);
      startTransition(() => reset());
    }
  }, [status, setStep, nextStep, reset]);

  const isFilled = !active && !!cart.shipping_address?.address_1;

  return (
    <form
      action={action}
      className="flex flex-col gap-8 border-t border-accent py-8"
    >
      <div className="flex items-center justify-between">
        <Heading desktopSize="xs" font="sans" mobileSize="xs" tag="h6">
          Nhập thông tin đặt hàng
        </Heading>
        {isFilled && (
          <Cta onClick={() => setStep("addresses")} size="sm" variant="outline">
            Chỉnh sửa
          </Cta>
        )}
      </div>
      {isFilled && (
        <div className="flex w-full flex-col gap-4 lg:flex-row">
          <div className="flex flex-1 flex-col gap-4">
            <Body className="font-semibold" font="sans">
              Địa chỉ nhận hàng
            </Body>
            <div className="flex flex-col gap-[6px]">
              <Body font="sans">
                {cart.shipping_address?.first_name}{" "}
                {cart.shipping_address?.last_name}
              </Body>
              <Body font="sans">{cart.shipping_address?.address_1}</Body>
              {/* <Body font="sans">
                {cart.shipping_address?.postal_code},{" "}
                {cart.shipping_address?.city}
              </Body> */}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <Body className="font-semibold" font="sans">
              Liên hệ
            </Body>
            <Body font="sans">Email: {cart.email}</Body>
            <Body font="sans">SĐT: {cart.shipping_address?.phone}</Body>
          </div>
        </div>
      )}
      {active && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4">
            <AddressInputs
              address={cart.shipping_address}
              addressName="shipping_address"
              // countries={cart.region?.countries}
            />
          </div>
          {/* <Checkbox
            checked={checked}
            onCheckedChange={(v) =>
              setChecked(v === "indeterminate" ? false : v)
            }
          /> */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* {cart.shipping_address?.phone}*/}
            {/* <Input
              defaultValue={cart.shipping_address?.phone}
              name="phone"
              placeholder="Số điện thoại"
              required
            />  */}
            <Input
              defaultValue={cart.email}
              name="email"
              placeholder="Email"
              required
            />
          </div>

          {/* {!checked && (
            <>
              <Heading desktopSize="xs" font="sans" mobileSize="xs" tag="h6">
                Billing address
              </Heading>
              <div className="grid gap-4 lg:grid-cols-2">
                <AddressInputs
                  address={cart.billing_address}
                  addressName="billing_address"
                  countries={cart.region?.countries}
                />
                <Input
                  defaultValue={cart.billing_address?.phone}
                  name="billing_address.phone"
                  placeholder="Phone"
                />
              </div>
            </>
          )} */}
          <SubmitButton />
        </div>
      )}
    </form>
  );
}

function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <Cta loading={pending} size="sm" type="submit">
      Bước tiếp theo
    </Cta>
  );
}

function AddressInputs({
  address,
  addressName,
  // countries,
}: {
  address?: StoreCartAddress;
  addressName: string;
  // countries?: BaseRegionCountry[];
}) {
  const inputName = (name: string) => addressName + "." + name;
  

  return (
    <>
      <Input
        defaultValue={address?.first_name}
        name={inputName("first_name")}
        placeholder="Tên người nhận"
        required
      />
      {/* <Input
        defaultValue={address?.last_name}
        name={inputName("last_name")}
        placeholder="Last name"
        required
      /> */}
      <Input
        defaultValue={address?.address_1}
        name={inputName("address_1")}
        placeholder="Địa chỉ"
        required
      />
      <Input
        defaultValue={address?.phone}
        name={inputName("phone")}
        placeholder="Số điện thoại"
        required
      />
      {/* <Input
        defaultValue={address?.company}
        name={inputName("company")}
        placeholder="Company"
      /> */}
      {/* <Input
        defaultValue={address?.postal_code}
        name={inputName("postal_code")}
        placeholder="Postal code"
        required
      /> */}
      {/* <Input
        defaultValue={address?.city}
        name={inputName("city")}
        placeholder="City"
        required
      /> */}
      {/* <InputCombobox
        defaultValue={address?.country_code}
        name={inputName("country_code")}
        options={
          countries
            ?.filter(
              (
                country,
              ): country is {
                display_name: string;
                iso_2: string;
              } & BaseRegionCountry =>
                !!country.display_name && !!country.iso_2,
            )
            .map(({display_name, iso_2}) => ({
              id: iso_2,
              label: display_name,
            })) || []
        }
        placeholder="Country"
        required
      /> */}
      {/* <Input
        defaultValue={address?.province}
        name={inputName("province")}
        placeholder="State/Province"
        required
      /> */}
    </>
  );
}
