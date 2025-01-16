import { AbstractPaymentProvider, BigNumber} from "@medusajs/framework/utils"
import { CreatePaymentProviderSession, Logger, PaymentProviderError, PaymentProviderSessionResponse, PaymentSessionStatus, ProviderWebhookPayload, UpdatePaymentProviderSession, WebhookActionResult } from "@medusajs/framework/types"
import { MedusaContainer } from "@medusajs/types"
import PayOS from "@payos/node";
import { createHmac } from "crypto";

type Options = {
  apiKey: string,
  clientId: string,
  checksumKey: string,
}

class PayOsProviderService extends AbstractPaymentProvider<Options> {
  async getWebhookActionAndData(data: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    return {
      action: "not_supported"
    }
  }

  async cancelPayment(paymentData: Record<string, unknown>): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    console.log("Cancelling payment with paymentData: ", paymentData)
    return {}
  }

  async refundPayment(paymentData: Record<string, unknown>, refundAmount: number): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    console.log("refundPayment payment with paymentData: ", paymentData)
    return {}
  }

  async retrievePayment(paymentSessionData: Record<string, unknown>): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    console.log("retrievePayment payment with paymentData: ", paymentSessionData)
    return {}
  }

  async updatePayment(context: UpdatePaymentProviderSession): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    console.log("updatePayment payment with paymentData: ", context)
    return {
      data: {},
    }
  }

  static identifier = "payos"
  protected client: PayOS
  protected logger_: Logger

  constructor(
    container: MedusaContainer,
    options: Options
  ) {
    super(container, options)
    this.client = new PayOS(
      options.clientId,
      options.apiKey,
      options.checksumKey
    )
  }

  async initiatePayment(
    context: CreatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    const {
      amount,
      currency_code,
      context: customerDetails
    } = context
    console.log("Initiating payment with context: ", customerDetails)
    const desc = customerDetails.session_id.replace("payses_01", "")
    try {
      const body = {
        orderCode: Number(String(Date.now()).slice(-6)),
        amount: Number(amount),
        description: desc,
        returnUrl: process.env.CHECKOUT_URL,
        cancelUrl: customerDetails.session_id,
      };
      const payOSCheckoutData = await this.client.createPaymentLink(body);

      console.log(`Initiating payment with payOSCheckoutData: ${payOSCheckoutData}`)
      console.log(payOSCheckoutData)

      return {
        // session_data: customerDetails,
        // status: "pending",
        data: {
          status: "pending",
          session_data: customerDetails,
          payOSCheckoutData: payOSCheckoutData
        }
      }
    } catch (e) {
      return {
        error: e,
        code: "unknown",
        detail: e
      }
    }
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<
    | PaymentProviderError
    | {
        status: PaymentSessionStatus
        data: PaymentProviderSessionResponse["data"]
      }
  > {
    const status = await this.getPaymentStatus(paymentSessionData)
    console.log("Authorizing payment with status: ", status)
    return { data: paymentSessionData, status }
  }

  async getPaymentStatus(
        paymentSessionData: Record<string, unknown>
      ): Promise<PaymentSessionStatus> {
        const payOSData = paymentSessionData.payOSCheckoutData as { paymentLinkId: string } | undefined
        const paymentLinkId = payOSData?.paymentLinkId

        console.log("Getting payment status with paymentLinkId: ", paymentLinkId)
        try {
          const paymentData = await this.client.getPaymentLinkInformation(paymentLinkId)
    
          switch (paymentData.status) {
            // case "requires_capture":
            //   return "authorized"
            case "PAID":
              return "captured"
            case "CANCELLED":
              return "canceled"
            default:
              return "pending"
          }
        } catch (e) {
          return "error"
        }
      }

  
  async capturePayment(
    paymentData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    const externalId = paymentData.id

    console.log("Capturing payment with external id: ", externalId)
    console.log("Capturing payment with external data: ", paymentData)

    try {
      const newData = []

      return {
        ...newData,
        id: externalId
      }
    } catch (e) {
      return {
        error: e,
        code: "unknown",
        detail: e
      }
    }
  }
  async deletePayment(
    paymentSessionData: Record<string, any>
  ): Promise<Record<string, unknown> | PaymentProviderError> {
    try {
      console.log("Deleting payment with paymentSessionData")
      if(paymentSessionData?.payOSCheckoutData?.paymentLinkId) {
        this.client.cancelPaymentLink(String(paymentSessionData.payOSCheckoutData.paymentLinkId))
      }
      return {}
    } catch (e) {
      return {
        error: e,
        code: "unknown",
        detail: e
      }
    }
  }

  // async getWebhookActionAndData(
  //   payload: ProviderWebhookPayload["payload"]
  // ): Promise<WebhookActionResult> {
  //   const {
  //     data,
  //     rawData,
  //     headers
  //   } = payload

  //   try {

  //     // console.log("Getting webhook action and data with payload: ", payload)
  //     // console.log("Getting webhook action and data with data: ", data)

  //     const data = {
  //       code: '00',
  //       desc: 'success',
  //       success: true,
  //       data: {
  //         accountNumber: '8844043418',
  //         amount: 6000,
  //         description: 'CSU1ZPIH5Q7 JHNKY43AZ2NM65N1KRG0K3BZ',
  //         reference: 'c60f5965-371e-4111-a237-9fc933f89af7',
  //         transactionDateTime: '2025-01-16 01:35:13',
  //         virtualAccountNumber: 'V3CAS8844043418',
  //         counterAccountBankId: '',
  //         counterAccountBankName: '',
  //         counterAccountName: null,
  //         counterAccountNumber: null,
  //         virtualAccountName: '',
  //         currency: 'VND',
  //         orderCode: 82735,
  //         paymentLinkId: 'a8893c40d2494c23b4cd7916f1488cf8',
  //         code: '00',
  //         desc: 'success'
  //       },
  //       signature: '52faeb2b7b80b4b4f6b68e141941c915e7f2ce64d9a835c8a0bff7cc6da44aa5'
  //     }
  //     const sessionId = `payses_01${data.data.description.split(" ").pop()}`

  //     // console.log(sessionId);
      
  //     const isValid = await this.isValidData(data.data, data.signature, process.env.PAYOS_CHECKSUM_KEY);
  //     if (!isValid) {
  //       console.log("payment failed. Trigger failed")
  //       return {
  //         action: "failed",
  //         data: {
  //           session_id: sessionId,
  //           amount: new BigNumber(data.data.amount as number)
  //         }
  //       }
  //     } else {
  //       if (data.success ) {
  //         console.log("payment success. Trigger Capture")
  //         return {
  //           action: "captured",
  //           data: {
  //             session_id: sessionId,
  //             amount: new BigNumber(data.data.amount as number)
  //           }
  //         }
  //       }
  //     }
  //     console.log("payment not support. Trigger not_supported");
  //     return {
  //       action: "not_supported"
  //     }
  //   } catch (e) {
  //     console.log("payment execption. Trigger failed")
  //     return {
  //       action: "failed",
  //       data: {
  //         session_id: "unknown",
  //         amount: new BigNumber(0)
  //       }
  //     }
  //   }
  // }

  async sortObjDataByKey(object) {
    const orderedObject = Object.keys(object)
      .sort()
      .reduce((obj, key) => {
        obj[key] = object[key];
        return obj;
      }, {});
    return orderedObject;
  }

  async convertObjToQueryStr(object) {
    return Object.keys(object)
      .filter((key) => object[key] !== undefined)
      .map((key) => {
        let value = object[key];
        // Sort nested object
        if (value && Array.isArray(value)) {
          value = JSON.stringify(value.map(async (val) => await this.sortObjDataByKey(val)));
        }
        // Set empty string if null
        if ([null, undefined, "undefined", "null"].includes(value)) {
          value = "";
        }

        return `${key}=${value}`;
      })
      .join("&");
  }

  async isValidData(data, currentSignature, checksumKey) {
    const sortedDataByKey = await this.sortObjDataByKey(data);
    const dataQueryStr = await this.convertObjToQueryStr(sortedDataByKey);
    const dataToSignature = createHmac("sha256", checksumKey)
      .update(dataQueryStr)
      .digest("hex");
    return dataToSignature == currentSignature;
  }

}
export default PayOsProviderService