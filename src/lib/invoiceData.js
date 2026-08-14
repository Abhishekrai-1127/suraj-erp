export const initialInvoiceData = {
  company: {
    name: 'SURAJ ENTERPRISES',
    subtitle: 'ENGINEERS & CONSULTANTS',
    description: 'Industrial Items : High Pressure Blowers, I.D./F.D. Fan Blowers, Burners, Heating Pumping Units, Axial Flow Fan, Butterfly Valve, Boilers etc.',
    address: 'Gali No. 3, Village Libaspur City, Near Payare Lal Compound, Delhi-110042',
    mobile: '+91 9811796630',
    email: 'surajenterprises@gmail.com',
    gstin: '07AVPPS1373Q1ZM',
    pan: 'AVPPS1373Q',
    stateCode: '07',
    state: 'Delhi',
    logo: ''
  },
  invoice: {
    number: 'INV-2026-1441',
    date: '2026-05-07',
    placeOfSupply: '07 - Delhi',
    reverseCharge: 'No',
    irn: '4b9188e76c1234567890abcdef1234567890abcdef1234567890abcdef123456',
    ackNo: '112610987654',
    ackDate: '2026-05-07'
  },
  transporter: {
    name: 'Roadways Express Logistics',
    vehicleNo: 'DL1LAA1159',
    dateOfSupply: '2026-05-07',
    placeOfSupply: 'Delhi',
    eWayBillNo: '241098765432',
    eWayBillDate: '2026-05-07'
  },
  billing: {
    name: 'Acme Corp Pvt Ltd',
    gstin: '07AAACA123411Z5',
    mobile: '+91 9876543210',
    email: 'accounts@acmecorp.com',
    address: 'Plot 42, Industrial Area Phase 2, Okhla, New Delhi - 110020'
  },
  shipping: {
    name: 'Acme Corp Pvt Ltd (Warehouse 2)',
    gstin: '07AAACA123411Z5',
    mobile: '+91 9876543211',
    email: 'logistics@acmecorp.com',
    address: 'Factory Gate 3, Sector 58, Faridabad, Haryana - 121004'
  },
  items: [
    {
      description: '40 H.P. High Pressure Blower 2880 RPM 3700 CFM 40" WG',
      hsnSac: '84145930',
      qty: 1,
      unit: 'Nos',
      listPrice: 260000.00,
      discRupees: 0,
      taxPercent: 18.00
    },
    {
      description: 'Industrial Heavy Duty Butterfly Valve 6 Inch',
      hsnSac: '84818030',
      qty: 4,
      unit: 'Pcs',
      listPrice: 12500.00,
      discRupees: 2000.00,
      taxPercent: 18.00
    }
  ],
  flatDiscount: 0,
  settlement: {
    bankAmount: 363440.00,
    cashAmount: 0.00,
    paymentMethod: 'Bank Transfer'
  },
  bank: {
    accountNumber: '629705017715',
    name: 'ICICI BANK',
    ifsc: 'ICICI0006297',
    branch: 'Mayur Vihar Phase-1, Delhi-110091',
    accountName: 'SURAJ ENTERPRISES'
  },
  terms: [
    'Our responsibility ceases after delivery of goods from our premises or delivery to the carrier.',
    'Goods once sold cannot be taken back.',
    'Subject to Delhi Jurisdiction.',
    'E. & O.E.'
  ],
  originalCopyType: 'Original Copy',
  showEInvoiceQR: true,
  showBankQR: false,
  showLogo: true,
  footerCreatedBy: 'Suraj ERP'
};

export function mapErpInvoiceToTally(erpInvoice) {
  if (!erpInvoice) return initialInvoiceData;

  const invoiceNum = erpInvoice.id || erpInvoice.refNo || 'INV-2026-001';
  const customerName = erpInvoice.customer || erpInvoice.customerName || 'Acme Corp Ltd';
  const rawAmount = typeof erpInvoice.amount === 'number' 
    ? erpInvoice.amount 
    : parseFloat(String(erpInvoice.amount || '0').replace(/[^0-9.]/g, '')) || 12450;

  return {
    ...initialInvoiceData,
    invoice: {
      ...initialInvoiceData.invoice,
      number: invoiceNum,
      date: erpInvoice.date || new Date().toISOString().split('T')[0],
      placeOfSupply: erpInvoice.placeOfSupply || '07 - Delhi',
      irn: erpInvoice.irn || initialInvoiceData.invoice.irn,
      ackNo: erpInvoice.ackNo || initialInvoiceData.invoice.ackNo,
      ackDate: erpInvoice.ackDate || erpInvoice.date || initialInvoiceData.invoice.ackDate
    },
    billing: {
      ...initialInvoiceData.billing,
      name: customerName,
      gstin: erpInvoice.gstin || '07AAACA123411Z5',
      address: erpInvoice.billingAddress || initialInvoiceData.billing.address
    },
    shipping: {
      ...initialInvoiceData.shipping,
      name: erpInvoice.shippingName || customerName,
      gstin: erpInvoice.gstin || '07AAACA123411Z5',
      address: erpInvoice.shippingAddress || erpInvoice.billingAddress || initialInvoiceData.shipping.address
    },
    items: erpInvoice.items && erpInvoice.items.length > 0 
      ? erpInvoice.items.map(item => ({
          description: item.description || item.name || 'Industrial Item',
          hsnSac: item.hsnSac || item.hsn || '84145930',
          qty: parseFloat(item.qty || item.quantity || 1),
          unit: item.unit || 'Nos',
          listPrice: parseFloat(item.listPrice || item.rate || item.price || rawAmount),
          discRupees: parseFloat(item.discRupees || item.discount || 0),
          taxPercent: parseFloat(item.taxPercent || item.tax || 18)
        }))
      : [
          {
            description: erpInvoice.description || 'Industrial Machinery Equipment & Components',
            hsnSac: '84145930',
            qty: 1,
            unit: 'Nos',
            listPrice: rawAmount / 1.18,
            discRupees: 0,
            taxPercent: 18
          }
        ],
    settlement: {
      bankAmount: rawAmount,
      cashAmount: 0,
      paymentMethod: 'Bank Transfer'
    }
  };
}
