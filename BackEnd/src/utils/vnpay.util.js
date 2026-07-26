// ================================================================
// vnpay.util.js — Tiện ích tạo/verify VNPAY URL
// Đặt tại: src/utils/vnpay.util.js
// Docs: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
// ================================================================
import crypto from "crypto";
import { env } from "../config/env.js";

// Sort object keys và build query string (VNPAY yêu cầu sort alphabetically)
const sortObject = (obj) => {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

/**
 * Tạo URL thanh toán VNPAY
 * @param {object} params
 * @param {string} params.orderId      - ID đơn hàng trong DB
 * @param {string} params.orderCode    - Mã đơn hàng (ORD-xxx)
 * @param {number} params.amount       - Số tiền (VND)
 * @param {string} params.orderInfo    - Thông tin đơn hàng
 * @param {string} params.ipAddr       - IP người dùng
 * @param {string} params.returnUrl    - URL callback sau thanh toán
 */
export const createVNPayUrl = ({
  orderId,
  orderCode,
  amount,
  orderInfo,
  ipAddr,
  returnUrl,
}) => {
  const tmnCode = env.VNP_TMN_CODE;
  const secretKey = env.VNP_HASH_SECRET;
  const vnpUrl =
    env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

  // Format thời gian theo giờ Việt Nam (GMT+7) đúng chuẩn VNPAY yêu cầu
  // toISOString() luôn trả UTC nên phải cộng bù 7 tiếng trước khi format
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
    vnp_TxnRef: orderCode, // mã đơn hàng — dùng orderCode cho dễ tra
    vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderCode}`,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100, // VNPAY nhân 100
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
 * Verify callback từ VNPAY
 * @param {object} vnpParams - req.query từ VNPAY callback
 * @returns {object} { isValid, responseCode, orderCode, amount, transactionCode }
 */
export const verifyVNPayReturn = (vnpParams) => {
  const secretKey = env.VNP_HASH_SECRET;
  const secureHash = vnpParams.vnp_SecureHash;

  // Xoá hash khỏi params trước khi verify
  const params = { ...vnpParams };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sortedParams = sortObject(params);
  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return {
    isValid: signed === secureHash,
    responseCode: vnpParams.vnp_ResponseCode, // "00" = thành công
    orderCode: vnpParams.vnp_TxnRef,
    amount: Number(vnpParams.vnp_Amount) / 100,
    transactionCode: vnpParams.vnp_TransactionNo,
    bankCode: vnpParams.vnp_BankCode,
    rawCallback: vnpParams,
  };
};
