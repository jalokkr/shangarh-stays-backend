interface ChargeBreakdown {
  baseAmount: number;
  gstAmount: number;
  gstPercentage: number;
  razorpayCharges: number;
  razorpayPercentage: number;
  totalAmount: number;
}

export const calculateCharges = (baseAmount: number): ChargeBreakdown => {
  // GST calculation (18% for hospitality services in India)
  const gstPercentage = 18;
  const gstAmount = (baseAmount * gstPercentage) / 100;

  // Razorpay charges (2% + ₹3.5 per transaction)
  const razorpayPercentage = 2;
  const razorpayFixedCharge = 3.5;
  const razorpayVariableCharge = (baseAmount * razorpayPercentage) / 100;
  const razorpayCharges = razorpayVariableCharge + razorpayFixedCharge;

  // Total amount including all charges
  const totalAmount = baseAmount + gstAmount + razorpayCharges;

  return {
    baseAmount,
    gstAmount,
    gstPercentage,
    razorpayCharges,
    razorpayPercentage,
    totalAmount
  };
};

export const calculateChargesDetailed = (baseAmount: number) => {
  const charges = calculateCharges(baseAmount);

  return {
    baseAmount: charges.baseAmount,
    gst: {
      percentage: charges.gstPercentage,
      amount: charges.gstAmount
    },
    razorpayCharges: {
      percentage: charges.razorpayPercentage,
      fixedCharge: 3.5,
      variableCharge: (baseAmount * charges.razorpayPercentage) / 100,
      total: charges.razorpayCharges
    },
    totalAmount: charges.totalAmount
  };
};