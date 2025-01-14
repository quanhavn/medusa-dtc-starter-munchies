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
  // async cancelPayment(paymentData: Record<string, unknown>): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
  //   console.log("Cancelling payment with paymentData: ", paymentData)
  //   return {}
  // }
  // async refundPayment(paymentData: Record<string, unknown>, refundAmount: number): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
  //   console.log("refundPayment payment with paymentData: ", paymentData)
  //   return {}
  // }
  // async retrievePayment(paymentSessionData: Record<string, unknown>): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
  //   console.log("retrievePayment payment with paymentData: ", paymentSessionData)
  //   return {}
  // }
  // async updatePayment(context: UpdatePaymentProviderSession): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
  //   console.log("updatePayment payment with paymentData: ", context)
  //   return {
  //     data: {},
  //   }
  // }
  // async getWebhookActionAndData(data: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
  //   console.log("getWebhookActionAndData payment with paymentData: ", data)
  //   return {
  //     action: "not_supported"
  //   }
  // }

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

    try {
      const body = {
        orderCode: Number(String(Date.now()).slice(-6)),
        amount: Number(amount),
        description: "Thanhtoan",
        returnUrl: "http://localhost:3000/checkout",
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
        const externalId = String(paymentSessionData.id)
        console.log("Getting payment status with external id: ", externalId)
    
        try {
          // assuming you have a client that retrieves the payment status
          const paymentData = await this.client.getPaymentLinkInformation(externalId)
    
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
      // assuming you have a client that captures the payment
      // const newData = await this.client.capturePayment(externalId)
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

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const {
      data,
      rawData,
      headers
    } = payload

    try {

      const data1 = {
        code: "00",
        desc: "success",
        success: true,
        data: {
          orderCode: 123,
          amount: 3000,
          description: "VQRIO123",
          accountNumber: "12345678",
          reference: "TF230204212323",
          transactionDateTime: "2023-02-04 18:25:00",
          currency: "VND",
          paymentLinkId: "124c33293c43417ab7879e14c8d9eb18",
          code: "00",
          desc: "Thành công",
          counterAccountBankId: "",
          counterAccountBankName: "",
          counterAccountName: "",
          counterAccountNumber: "",
          virtualAccountName: "",
          virtualAccountNumber: "",
        },
        signature: "412e915d2871504ed31be63c8f62a149a4410d34c4c42affc9006ef9917eaa03",
      };

      const isValid = await this.isValidData(data1.data, data1.signature, process.env.PAYOS_CHECKSUM_KEY);
      if (!isValid) {
        return {
          action: "failed",
          data: {
            session_id: (data.metadata as Record<string, any>).session_id,
            amount: new BigNumber(data.amount as number)
          }
        }
      } else {
        if (data1.success ) {
          return {
            action: "captured",
            data: {
              session_id: (data.metadata as Record<string, any>).session_id,
              amount: new BigNumber(data.amount as number)
            }
          }
        }
      }
      return {
        action: "not_supported"
      }
    } catch (e) {
      return {
        action: "failed",
        data: {
          session_id: (data.metadata as Record<string, any>).session_id,
          amount: new BigNumber(data.amount as number)
        }
      }
    }
  }

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