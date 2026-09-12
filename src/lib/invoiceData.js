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
    number: '',
    date: new Date().toISOString().split('T')[0],
    placeOfSupply: '07 - Delhi',
    reverseCharge: 'No',
    irn: '',
    ackNo: '',
    ackDate: ''
  },
  transporter: {
    name: '',
    vehicleNo: '',
    dateOfSupply: '',
    placeOfSupply: 'Delhi',
    eWayBillNo: '',
    eWayBillDate: ''
  },
  billing: {
    name: '',
    gstin: '',
    mobile: '',
    email: '',
    address: ''
  },
  shipping: {
    name: '',
    gstin: '',
    mobile: '',
    email: '',
    address: ''
  },
  items: [],
  flatDiscount: 0,
  settlement: {
    bankAmount: 0.00,
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

  const invoiceNum = erpInvoice.id || erpInvoice.refNo || 'INV-001';
  const customerName = erpInvoice.customer || erpInvoice.customerName || '';
  const rawAmount = typeof erpInvoice.amount === 'number' 
    ? erpInvoice.amount 
    : parseFloat(String(erpInvoice.amount || '0').replace(/[^0-9.]/g, '')) || 0;

  return {
    ...initialInvoiceData,
    invoice: {
      ...initialInvoiceData.invoice,
      number: invoiceNum,
      date: erpInvoice.date || new Date().toISOString().split('T')[0],
      placeOfSupply: erpInvoice.placeOfSupply || '07 - Delhi',
      irn: erpInvoice.irn || '',
      ackNo: erpInvoice.ackNo || '',
      ackDate: erpInvoice.ackDate || erpInvoice.date || ''
    },
    billing: {
      ...initialInvoiceData.billing,
      name: customerName,
      gstin: erpInvoice.gstin || '',
      address: erpInvoice.billingAddress || ''
    },
    shipping: {
      ...initialInvoiceData.shipping,
      name: erpInvoice.shippingName || customerName,
      gstin: erpInvoice.gstin || '',
      address: erpInvoice.shippingAddress || erpInvoice.billingAddress || ''
    },
    items: erpInvoice.items && erpInvoice.items.length > 0 
      ? erpInvoice.items.map(item => ({
          description: item.description || item.name || '',
          hsnSac: item.hsnSac || item.hsn || '',
          qty: parseFloat(item.qty || item.quantity || 1),
          unit: item.unit || '',
          listPrice: parseFloat(item.listPrice || item.rate || item.unitPrice || item.price || 0),
          discRupees: parseFloat(item.discRupees || item.discount || 0),
          taxPercent: parseFloat(item.taxPercent || item.tax || 18)
        }))
      : [],
    settlement: {
      bankAmount: rawAmount,
      cashAmount: 0,
      paymentMethod: 'Bank Transfer'
    }
  };
}
