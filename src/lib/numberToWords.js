/**
 * Converts a number to words in the Indian Numbering System (Lakhs, Crores).
 * e.g., 116800.00 => "Rs. One Lakh Sixteen Thousand Eight Hundred Only"
 * 
 * @param {number|string} num - The number to convert
 * @returns {string} The words representation of the number
 */
export function numberToWords(num) {
  if (num === null || num === undefined || isNaN(Number(num))) return '';
  
  const floatNum = parseFloat(num);
  if (floatNum === 0) return 'Rs. Zero Only';
  
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertLessThanThousand(n) {
    if (n === 0) return '';
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }

  // Format to 2 decimal places to capture paise
  const parts = floatNum.toFixed(2).split('.');
  let rupees = parseInt(parts[0], 10);
  const paise = parseInt(parts[1], 10);
  
  let words = '';
  
  if (rupees > 0) {
    // Crores (1,00,00,000)
    if (Math.floor(rupees / 10000000) > 0) {
      words += convertLessThanThousand(Math.floor(rupees / 10000000)) + ' Crore ';
      rupees %= 10000000;
    }
    // Lakhs (1,00,000)
    if (Math.floor(rupees / 100000) > 0) {
      words += convertLessThanThousand(Math.floor(rupees / 100000)) + ' Lakh ';
      rupees %= 100000;
    }
    // Thousands (1,000)
    if (Math.floor(rupees / 1000) > 0) {
      words += convertLessThanThousand(Math.floor(rupees / 1000)) + ' Thousand ';
      rupees %= 1000;
    }
    // Remainder (< 1000)
    if (rupees > 0) {
      words += convertLessThanThousand(rupees);
    }
  }
  
  words = words.trim();
  
  let result = 'Rs. ';
  if (words) {
    result += words;
  } else {
    result += 'Zero';
  }
  
  if (paise > 0) {
    const paiseText = convertLessThanThousand(paise);
    if (words) {
      result += ' and ' + paiseText + ' Paise';
    } else {
      result += paiseText + ' Paise';
    }
  }
  
  result += ' Only';
  return result;
}
