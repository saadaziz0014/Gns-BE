const Payment = require("../models/Payment");

exports.jazzCashTransaction = async (transactionAmount, mobileAccountNo) => {
  transactionAmount *= 100;
  let dateNow = new Date();
  const currentDateTime = date.format(dateNow, "YYYYMMDDHHmmss");
  const refNo = "T" + currentDateTime;
  const header = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  let body = {
    pp_Version: "1.1",
    pp_TxnType: "OTC",
    pp_Language: "EN",
    pp_MerchantID: process.env.jazzCashMerchantIdSB,
    pp_SubMerchantID: "",
    pp_Password: process.env.jazzCashMerchantPassSB,
    pp_BankID: "",
    pp_ProductID: "",
    pp_TxnRefNo: refNo,
    pp_Amount: transactionAmount,
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: currentDateTime,
    pp_BillReference: "billRef",
    pp_Description: "Description of transaction",
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_ReturnURL: process.env.jazzCashMerchantReturnUrlSB,
    ppmpf_1: process.env.mobileAccountNo,
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };
  const sortedList = {};
  Object.keys(body)
    .sort()
    .forEach(function (key) {
      if (key != "pp_SecureHash") sortedList[key] = body[key];
    });
  let finalString = process.env.jazzCashMerchantIntegeritySaltSB + "&";
  Object.keys(sortedList).forEach(function (key) {
    finalString = finalString.concat(body[key]);
    if (body[key] != null && body[key] != "")
      finalString = finalString.concat("&");
  });
  finalString = finalString.substr(0, finalString.length - 1);
  const hash = crypto
    .createHmac("SHA256", process.env.jazzCashMerchantIntegeritySaltSB)
    .update(Buffer.from(finalString, "utf-8"))
    .digest("hex");

  body.pp_SecureHash = hash;
  body = JSON.stringify(body);
  // console.log(body, "body")
  let options = {
    url: constants.constants.jazzcashUrlSB + "Payment/DoTransaction",
    method: "POST",
    body: body,
    headers: header,
  };
  // console.log(options, "options")
  return new Promise((resolve, reject) => {
    if (transactionAmount < 100) {
      console.log(
        "Jazzcash error in transaction, trasaction amount should be greater than 1"
      );
      resolve({
        success: false,
        message: "trasaction amount should be greater than or equal to 1",
      });
    } else {
      let result = "";
      request(options, async (error, response, body) => {
        result = JSON.parse(body);
        if (
          result.pp_ResponseCode !== "124" &&
          result.pp_ResponseCode != "000"
        ) {
          console.log("error in jazzcash transaction");
          resolve({
            success: false,
            message: "transaction failed",
            response: result,
          });
        } else {
          let payment = {
            bankName: "JAZZCASH",
            transactionId: result.pp_TxnRefNo ? result.pp_TxnRefNo : "",
            finalAmount: transactionAmount,
            transactionStatus:
              result.pp_ResponseCode == "124" || result.pp_ResponseCode == "000"
                ? "Success"
                : "Failed",
          };
          await Payment.create(payment);
          resolve({
            success: true,
            response: result,
          });
        }
      });
    }
  });
};
