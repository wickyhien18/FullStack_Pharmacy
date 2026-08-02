import crypto from "crypto";
import { env } from "../config/env.config.js";

// Sort object keys và build query string (VNPAY require sort alphabetically)
const sortObject = (obj) => {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

export const createVNPayUrl = ({
  orderId,
  orderCode,
  amount, //Amount money
  orderInfo,
  ipAddr, //User IP
  returnUrl, //URL callback
}) => {
  const tmnCode = env.VNP_TMN_CODE;
  const secretKey = env.VNP_HASH_SECRET;
  const vnpUrl =
    env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

  const formatVNPayDate = (date) => {
    const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return vnTime
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);
  };

  const date = new Date();
  const createDate = formatVNPayDate(date);
  const expireDate = formatVNPayDate(new Date(date.getTime() + 15 * 60 * 1000));

  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderCode,
    vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderCode}`,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100, // VNPAY multiple 100
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const sortedParams = sortObject(vnpParams);
  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  sortedParams.vnp_SecureHash = signed;

  return `${vnpUrl}?${new URLSearchParams(sortedParams).toString()}`;
};

/**
 * Verify callback from VNPAY
 * @param {object} vnpParams - req.query from VNPAY callback
 * @returns {object} { isValid, responseCode, orderCode, amount, transactionCode }
 */
export const verifyVNPayReturn = (vnpParams) => {
  const secretKey = env.VNP_HASH_SECRET;
  const secureHash = vnpParams.vnp_SecureHash;

  // Delete hash from params before verify
  const params = { ...vnpParams };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sortedParams = sortObject(params);
  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return {
    isValid: signed === secureHash,
    responseCode: vnpParams.vnp_ResponseCode, // "00" = success
    orderCode: vnpParams.vnp_TxnRef,
    amount: Number(vnpParams.vnp_Amount) / 100,
    transactionCode: vnpParams.vnp_TransactionNo,
    bankCode: vnpParams.vnp_BankCode,
    rawCallback: vnpParams,
  };
};
