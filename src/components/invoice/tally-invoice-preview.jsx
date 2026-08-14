"use client";

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { numberToWords } from '@/lib/numberToWords';
import './tally-invoice.css';

// Reusable QR Code component using local qrcode package
function InvoiceQR({ text, size = 100 }) {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (text) {
      QRCode.toDataURL(text, { width: size, margin: 1, errorCorrectionLevel: 'M' })
        .then(url => setQrUrl(url))
        .catch(err => console.error('QR Code error:', err));
    }
  }, [text, size]);

  if (!qrUrl) {
    return <div style={{ width: size, height: size, border: '1px dotted #ccc', margin: '0 auto' }} />;
  }

  return (
    <img 
      src={qrUrl} 
      alt="QR Code" 
      width={size} 
      height={size} 
      className="invoice-qr-img" 
      style={{ display: 'block', margin: '0 auto' }}
    />
  );
}

export default function TallyInvoicePreview({ data }) {
  if (!data) return null;

  const {
    company = {},
    invoice = {},
    transporter = {},
    billing = {},
    shipping = {},
    items = [],
    flatDiscount = 0,
    settlement = {},
    bank = {},
    terms = [],
    originalCopyType = 'Original Copy',
    showEInvoiceQR = true,
    showBankQR = false,
    showLogo = true,
    footerCreatedBy = 'Suraj ERP'
  } = data;

  // GST Type: 'CGST_SGST' | 'CGST_UTGST' | 'IGST'
  const gstType = invoice.gstType || 'CGST_SGST';
  const isIGST   = gstType === 'IGST';
  const isUTGST  = gstType === 'CGST_UTGST';
  const secondTaxLabel = isUTGST ? 'UTGST' : 'SGST';

  // Formatting helpers
  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '0.00';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const year = String(d.getFullYear()).slice(-2);
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Perform Calculations
  const processedItems = items.map((item, idx) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.listPrice) || 0;
    const discRupees = parseFloat(item.discRupees) || 0;
    const taxPercent = parseFloat(item.taxPercent) || 0;
    const effectiveGstType = item.gstType || gstType;

    const baseAmount = qty * price;
    const taxableAmount = baseAmount - discRupees;
    const taxAmount = taxableAmount * (taxPercent / 100);
    const totalAmount = taxableAmount + taxAmount;
    const halfTaxPercent = taxPercent / 2;
    const cgstAmount = taxAmount / 2;
    const sgstAmount = taxAmount / 2;
    const igstAmount = taxAmount;

    return {
      ...item,
      sr: idx + 1,
      taxableAmount,
      taxAmount,
      totalAmount,
      halfTaxPercent,
      cgstAmount,
      sgstAmount,
      igstAmount,
      effectiveGstType
    };
  });

  const subtotal = processedItems.reduce((sum, item) => sum + item.taxableAmount, 0);
  const totalTax = processedItems.reduce((sum, item) => sum + item.taxAmount, 0);
  const grandTotal = subtotal + totalTax - (parseFloat(flatDiscount) || 0);

  // Settlement details
  const bankAmount = parseFloat(settlement.bankAmount) || 0;
  const cashAmount = parseFloat(settlement.cashAmount) || 0;
  const settledAmount = bankAmount + cashAmount;
  const balanceAmount = grandTotal - settledAmount;

  // Tax Summary calculations — grouped by effectiveGstType + rate
  const taxGroups = {};
  processedItems.forEach(item => {
    const rate = parseFloat(item.taxPercent) || 0;
    const itemGstType = item.effectiveGstType;
    const key = `${itemGstType}::${rate}`;
    if (!taxGroups[key]) {
      taxGroups[key] = { taxable: 0, tax: 0, rate, itemGstType };
    }
    taxGroups[key].taxable += item.taxableAmount;
    taxGroups[key].tax += item.taxAmount;
  });

  const totalTaxableSale = Object.values(taxGroups).reduce((acc, v) => acc + v.taxable, 0);
  const totalTaxCollected = Object.values(taxGroups).reduce((acc, v) => acc + v.tax, 0);

  // Pad items table to keep clean Tally look filling A4 page
  const minRows = 8;
  const paddedRowsCount = Math.max(0, minRows - processedItems.length);
  const paddedRows = Array.from({ length: paddedRowsCount });

  // QR Code Payloads
  const upiPayee = bank.accountNumber ? `${bank.accountNumber}@${bank.ifsc || 'upi'}` : '';
  const upiPayload = `upi://pay?pa=${upiPayee || 'test@upi'}&pn=${encodeURIComponent(bank.accountName || company.name)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(invoice.number || 'Invoice')}`;

  const eInvoicePayload = JSON.stringify({
    Version: "1.1",
    Irn: invoice.irn || "",
    AckNo: invoice.ackNo || "",
    AckDt: invoice.ackDate || "",
    GstinSup: company.gstin || "",
    GstinRec: billing.gstin || "",
    DocNo: invoice.number || "",
    DocDt: invoice.date || "",
    TotVal: grandTotal
  });

  return (
    <div className="invoice-container">
      {/* Outer Tally Box */}
      <div className="tally-box">
        
        {/* Top Header Row */}
        <div className="tally-row border-bottom tally-top-bar">
          <div className="col-page-no font-small">Page No. 1 of 1</div>
          <div className="col-title text-center font-bold text-uppercase">Tax Invoice</div>
          <div className="col-copy-type font-small text-right">{originalCopyType}</div>
        </div>

        {/* Company Info Row */}
        <div className="tally-row border-bottom company-header-row">
          {showLogo && (
            <div className="company-logo-box">
              {company.logo ? (
                <img src={company.logo} alt="Company Logo" className="company-logo" />
              ) : (
                <div className="logo-placeholder">
                  <span>Add</span>
                  <span>Logo</span>
                </div>
              )}
            </div>
          )}
          
          <div className="company-details-box flex-grow">
            <h1 className="company-name font-bold text-center">{company.name || 'Add Company Name'}</h1>
            {company.subtitle && (
              <p className="company-subtitle text-center font-bold font-small">{company.subtitle}</p>
            )}
            {company.description && (
              <p className="company-description text-center font-small">{company.description}</p>
            )}
            <p className="company-address text-center font-small">{company.address || 'Add Address'}</p>
            <p className="company-contact text-center font-small">
              {company.mobile && `Mobile: ${company.mobile}`}
              {company.email && ` | Email: ${company.email}`}
            </p>
            <p className="company-tax-ids text-center font-small font-bold">
              {company.gstin && `GSTIN - ${company.gstin}`}
              {company.pan && ` | PAN - ${company.pan}`}
            </p>
          </div>
        </div>

        {/* Invoice & Transporter Row */}
        <div className="tally-row border-bottom metadata-two-col">
          {/* Invoice Details */}
          <div className="col-half border-right padding-small">
            <div className="meta-field"><span className="label font-bold">Invoice Number</span><span className="separator">:</span><span className="value font-monospace">{invoice.number}</span></div>
            <div className="meta-field"><span className="label font-bold">Invoice Date</span><span className="separator">:</span><span className="value">{formatDate(invoice.date)}</span></div>
            <div className="meta-field"><span className="label font-bold">Place of Supply</span><span className="separator">:</span><span className="value">{invoice.placeOfSupply}</span></div>
            <div className="meta-field"><span className="label font-bold">Reverse Charge</span><span className="separator">:</span><span className="value">{invoice.reverseCharge}</span></div>
          </div>

          {/* Transporter Details */}
          <div className="col-half padding-small">
            <div className="section-subtitle font-bold text-underline margin-bottom-xs">Transporter Details</div>
            <div className="meta-field"><span className="label font-bold">Transporter Mode</span><span className="separator">:</span><span className="value">{transporter.name}</span></div>
            <div className="meta-field"><span className="label font-bold">Vehicle No.</span><span className="separator">:</span><span className="value font-monospace">{transporter.vehicleNo}</span></div>
            <div className="meta-field"><span className="label font-bold">Date of Supply</span><span className="separator">:</span><span className="value">{formatDate(transporter.dateOfSupply)}</span></div>
            <div className="meta-field"><span className="label font-bold">Place of Supply</span><span className="separator">:</span><span className="value">{transporter.placeOfSupply}</span></div>
            <div className="meta-field"><span className="label font-bold">E-Way Bill No.</span><span className="separator">:</span><span className="value font-monospace">{transporter.eWayBillNo}</span></div>
            <div className="meta-field"><span className="label font-bold">E-Way Bill Date</span><span className="separator">:</span><span className="value">{formatDate(transporter.eWayBillDate)}</span></div>
          </div>
        </div>

        {/* Billing & Shipping Row */}
        <div className="tally-row border-bottom metadata-two-col">
          {/* Billing Details */}
          <div className="col-half border-right padding-small">
            <div className="section-subtitle font-bold text-underline margin-bottom-xs">Billing Details</div>
            <div className="meta-field"><span className="label font-bold">Name</span><span className="separator">:</span><span className="value font-bold">{billing.name}</span></div>
            <div className="meta-field-inline font-small font-bold margin-bottom-xs">
              <span>GSTIN: {billing.gstin || 'None'}</span>
              {billing.mobile && <span> | Mobile: {billing.mobile}</span>}
              {billing.email && <span> | Email: {billing.email}</span>}
            </div>
            <div className="address-block font-small">{billing.address}</div>
          </div>

          {/* Shipping Details */}
          <div className="col-half padding-small">
            <div className="section-subtitle font-bold text-underline margin-bottom-xs">Shipping Details</div>
            <div className="meta-field"><span className="label font-bold">Name</span><span className="separator">:</span><span className="value font-bold">{shipping.name}</span></div>
            <div className="meta-field-inline font-small font-bold margin-bottom-xs">
              <span>GSTIN: {shipping.gstin || 'None'}</span>
              {shipping.mobile && <span> | Mobile: {shipping.mobile}</span>}
              {shipping.email && <span> | Email: {shipping.email}</span>}
            </div>
            <div className="address-block font-small">{shipping.address}</div>
          </div>
        </div>

        {/* IRN Bar */}
        {(invoice.irn || invoice.ackNo) && (
          <div className="tally-row border-bottom irn-ack-bar font-small font-monospace">
            {invoice.irn && <span><strong className="font-sans">IRN-</strong> {invoice.irn}</span>}
            {invoice.ackNo && <span> | <strong className="font-sans">Ack No.-</strong> {invoice.ackNo}</span>}
            {invoice.ackDate && <span> | <strong className="font-sans">Ack Date-</strong> {formatDate(invoice.ackDate)}</span>}
          </div>
        )}

        {/* Items Table Container */}
        <div className="items-table-container">
          <table className="tally-table">
            <thead>
              <tr>
                <th className="th-sr">Sr.<br/>No.</th>
                <th className="th-desc">Description of<br/>Goods and Services</th>
                <th className="th-hsn">HSN/SAC</th>
                <th className="th-qty">Quantity</th>
                <th className="th-unit">Unit</th>
                <th className="th-price">Rate</th>
                <th className="th-disc">Disc.(₹)</th>
                <th className="th-amount">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {/* Processed items list */}
              {processedItems.map((item) => (
                <tr key={item.sr} className="item-row">
                  <td className="td-sr text-center">{item.sr}</td>
                  <td className="td-desc">{item.description}</td>
                  <td className="td-hsn text-center font-monospace">{item.hsnSac}</td>
                  <td className="td-qty text-right font-monospace">{parseFloat(item.qty).toFixed(2)}</td>
                  <td className="td-unit text-center">{item.unit}</td>
                  <td className="td-price text-right font-monospace">{formatCurrency(item.listPrice)}</td>
                  <td className="td-disc text-right font-monospace">{parseFloat(item.discRupees) > 0 ? formatCurrency(item.discRupees) : ''}</td>
                  <td className="td-amount text-right font-monospace font-bold">{formatCurrency(item.taxableAmount)}</td>
                </tr>
              ))}

              {/* Pad remaining height with empty rows to simulate Tally layout */}
              {paddedRows.map((_, idx) => (
                <tr key={`pad-${idx}`} className="pad-row">
                  <td className="td-sr">&nbsp;</td>
                  <td className="td-desc">&nbsp;</td>
                  <td className="td-hsn">&nbsp;</td>
                  <td className="td-qty">&nbsp;</td>
                  <td className="td-unit">&nbsp;</td>
                  <td className="td-price">&nbsp;</td>
                  <td className="td-disc">&nbsp;</td>
                  <td className="td-amount">&nbsp;</td>
                </tr>
              ))}

              {/* Subtotal row */}
              <tr className="subtotal-row">
                <td colSpan={7} className="text-right font-bold" style={{paddingRight: '8px', borderTop: '1px solid #ccc'}}>Subtotal</td>
                <td className="td-amount text-right font-monospace font-bold" style={{borderTop: '1px solid #ccc'}}>{formatCurrency(subtotal)}</td>
              </tr>

              {/* Tax line rows - per gstType+rate group */}
              {Object.values(taxGroups).map((grp) => {
                const { rate, itemGstType: gt, tax } = grp;
                const isGrpIGST = gt === 'IGST';
                const secLabel  = gt === 'CGST_UTGST' ? 'UTGST' : 'SGST';
                const halfPct   = parseFloat(rate) / 2;
                return isGrpIGST ? (
                  <tr key={`igst-${gt}-${rate}`} className="tax-line-row">
                    <td colSpan={7} className="text-right font-bold" style={{paddingRight: '8px'}}>
                      IGST @ {rate}%
                    </td>
                    <td className="td-amount text-right font-monospace">{formatCurrency(tax)}</td>
                  </tr>
                ) : (
                  <React.Fragment key={`cgst-${gt}-${rate}`}>
                    <tr className="tax-line-row">
                      <td colSpan={7} className="text-right font-bold" style={{paddingRight: '8px'}}>
                        CGST @ {halfPct}%
                      </td>
                      <td className="td-amount text-right font-monospace">{formatCurrency(tax / 2)}</td>
                    </tr>
                    <tr className="tax-line-row">
                      <td colSpan={7} className="text-right font-bold" style={{paddingRight: '8px'}}>
                        {secLabel} @ {halfPct}%
                      </td>
                      <td className="td-amount text-right font-monospace">{formatCurrency(tax / 2)}</td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {/* Flat Discount row */}
              {parseFloat(flatDiscount) > 0 && (
                <tr className="tax-line-row">
                  <td colSpan={7} className="text-right font-bold" style={{paddingRight: '8px'}}>Discount</td>
                  <td className="td-amount text-right font-monospace">- {formatCurrency(flatDiscount)}</td>
                </tr>
              )}

              {/* Grand Total row */}
              <tr className="grand-total-line-row">
                <td colSpan={4} className="text-right font-bold" style={{paddingRight: '8px', borderTop: '1px solid #999'}}>
                  Total
                </td>
                <td colSpan={1} className="text-center font-monospace font-bold" style={{borderTop: '1px solid #999'}}>
                  {processedItems.reduce((s, i) => s + parseFloat(i.qty || 0), 0).toFixed(2)} {processedItems[0]?.unit || ''}
                </td>
                <td colSpan={3} className="text-right font-monospace font-bold" style={{borderTop: '1px solid #999', paddingRight: '6px'}}>
                  Rs. {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Number to Words Row */}
        <div className="tally-row border-bottom padding-small words-row">
          <div>
            <div className="font-bold">Amount Chargeable (in words)</div>
            <div className="font-bold">{numberToWords(grandTotal)}</div>
          </div>
        </div>

        {/* GST Summary Table */}
        <div className="tally-row border-bottom gst-summary-section">
          <table className="gst-summary-table">
            <thead>
              <tr>
                <th className="gst-th">Taxable Value</th>
                <th className="gst-th">GST Type</th>
                <th className="gst-th">Rate</th>
                <th className="gst-th">CGST Amt</th>
                <th className="gst-th">SGST/UTGST Amt</th>
                <th className="gst-th">IGST Amt</th>
                <th className="gst-th">Total Tax</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(taxGroups).map((grp) => {
                const { rate, itemGstType: gt, tax, taxable } = grp;
                const isGrpIGST = gt === 'IGST';
                const typeLabel = isGrpIGST ? 'IGST' : gt === 'CGST_UTGST' ? 'CGST+UTGST' : 'CGST+SGST';
                return (
                  <tr key={`${gt}-${rate}`} className="gst-data-row">
                    <td className="gst-td text-right font-monospace">{formatCurrency(taxable)}</td>
                    <td className="gst-td text-center font-bold">{typeLabel}</td>
                    <td className="gst-td text-center">{rate}%</td>
                    <td className="gst-td text-right font-monospace">{!isGrpIGST ? formatCurrency(tax / 2) : '-'}</td>
                    <td className="gst-td text-right font-monospace">{!isGrpIGST ? formatCurrency(tax / 2) : '-'}</td>
                    <td className="gst-td text-right font-monospace">{isGrpIGST ? formatCurrency(tax) : '-'}</td>
                    <td className="gst-td text-right font-monospace font-bold">{formatCurrency(tax)}</td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr className="gst-total-row">
                <td className="gst-td text-right font-monospace font-bold">Total: {formatCurrency(totalTaxableSale)}</td>
                <td className="gst-td"></td>
                <td className="gst-td"></td>
                <td className="gst-td text-right font-monospace font-bold">
                  {formatCurrency(Object.values(taxGroups).filter(g => g.itemGstType !== 'IGST').reduce((s, g) => s + g.tax / 2, 0))}
                </td>
                <td className="gst-td text-right font-monospace font-bold">
                  {formatCurrency(Object.values(taxGroups).filter(g => g.itemGstType !== 'IGST').reduce((s, g) => s + g.tax / 2, 0))}
                </td>
                <td className="gst-td text-right font-monospace font-bold">
                  {formatCurrency(Object.values(taxGroups).filter(g => g.itemGstType === 'IGST').reduce((s, g) => s + g.tax, 0))}
                </td>
                <td className="gst-td text-right font-monospace font-bold">{formatCurrency(totalTaxCollected)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax Amount in Words */}
        <div className="tally-row border-bottom padding-small words-row">
          <span className="font-bold">Tax Amount (in words) &nbsp;</span>
          <span className="font-bold">{numberToWords(totalTaxCollected)}</span>
        </div>

        {/* Footer Grid: Terms, Bank Details + QR, E-Invoice QR, Signatures */}
        <div className="tally-row footer-grid-container">
          {/* Terms & Conditions */}
          <div className="footer-col terms-col border-right padding-small">
            <div className="section-subtitle font-bold text-underline margin-bottom-xs">Terms and Conditions</div>
            <div className="terms-content font-small">
              <div className="e-oe">E & O.E</div>
              {terms.map((term, index) => (
                <div key={index} className="term-item">
                  {index + 1}. {term}
                </div>
              ))}
            </div>
          </div>

          {/* Account Number & Bank QR Column */}
          <div className="footer-col bank-qr-col border-right padding-small flex-row">
            {showBankQR && (
              <div className="qr-box text-center margin-right-sm">
                <InvoiceQR text={upiPayload} size={85} />
              </div>
            )}
            <div className="bank-text-details font-small">
              <div className="meta-field-stack"><span className="label font-bold">Account Number:</span><span className="value font-monospace font-bold">{bank.accountNumber}</span></div>
              <div className="meta-field-stack"><span className="label font-bold">Bank:</span><span className="value font-bold">{bank.name}</span></div>
              <div className="meta-field-stack"><span className="label font-bold">IFSC:</span><span className="value font-monospace font-bold">{bank.ifsc}</span></div>
              <div className="meta-field-stack"><span className="label font-bold">Branch:</span><span className="value">{bank.branch}</span></div>
              <div className="meta-field-stack"><span className="label font-bold">Name:</span><span className="value">{bank.accountName}</span></div>
            </div>
          </div>

          {/* E-Invoice QR Column */}
          <div className="footer-col e-invoice-col border-right padding-small text-center flex-column justify-center align-center">
            {showEInvoiceQR && (
              <>
                <div className="section-subtitle font-bold text-center margin-bottom-xs">E-Invoice QR</div>
                <InvoiceQR text={eInvoicePayload} size={85} />
              </>
            )}
          </div>

          {/* Signature Column */}
          <div className="footer-col signature-col padding-small flex-column justify-between text-center">
            <div className="company-auth-label font-bold">
              For {company.name || 'Company Name'}
            </div>
            <div className="digital-sig-note text-center">
              This is a computer generated invoice.<br />
              Digitally signed, signature &amp; stamp not required.
            </div>
            <div className="signature-line font-bold font-small text-center">
              Authorized Signatory
            </div>
          </div>
        </div>

      </div>

      {/* Very bottom branding footer */}
      {footerCreatedBy && (
        <div className="invoice-bottom-branding font-small text-center text-muted margin-top-xs">
          Invoice Created by {footerCreatedBy.startsWith('http') || footerCreatedBy.startsWith('www.') ? (
            <a href={footerCreatedBy.startsWith('http') ? footerCreatedBy : `https://${footerCreatedBy}`} target="_blank" rel="noopener noreferrer">
              {footerCreatedBy}
            </a>
          ) : (
            <span>{footerCreatedBy}</span>
          )}
        </div>
      )}
    </div>
  );
}
