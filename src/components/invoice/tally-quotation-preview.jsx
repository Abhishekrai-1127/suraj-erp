"use client";

import React from "react";
import { numberToWords } from "@/lib/numberToWords";
import "./tally-invoice.css";

export default function TallyQuotationPreview({ data }) {
  if (!data) return null;

  const {
    company = {},
    quotation = {},
    billing = {},
    items = [],
    flatDiscount = 0,
    bank = {},
    terms = [],
    footerCreatedBy = "Suraj ERP",
  } = data;

  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0.00";
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, "0");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${day}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Calculations
  const processedItems = items.map((item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.listPrice) || 0;
    const discRupees = parseFloat(item.discRupees) || 0;
    const taxPercent = parseFloat(item.taxPercent) || 18;

    const baseAmount = qty * price;
    const taxableAmount = baseAmount - discRupees;
    const cgstAmt = taxableAmount * (taxPercent / 2 / 100);
    const sgstAmt = taxableAmount * (taxPercent / 2 / 100);
    const totalAmount = taxableAmount + cgstAmt + sgstAmt;

    return { ...item, qty, baseAmount, taxableAmount, cgstAmt, sgstAmt, taxPercent, totalAmount };
  });

  const subTotal = processedItems.reduce((s, i) => s + i.taxableAmount, 0);
  const totalCGST = processedItems.reduce((s, i) => s + i.cgstAmt, 0);
  const totalSGST = processedItems.reduce((s, i) => s + i.sgstAmt, 0);
  const totalQty = processedItems.reduce((s, i) => s + i.qty, 0);
  const grandTotal = subTotal + totalCGST + totalSGST - (parseFloat(flatDiscount) || 0);

  const grandTotalWords = numberToWords ? numberToWords(Math.round(grandTotal)) : "";

  return (
    <div className="invoice-container" style={{ fontFamily: "Arial, sans-serif", background: "#fff", color: "#000" }}>
      <div className="tally-box">
        {/* Page Header */}
        <div className="tally-header-bar" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #000", paddingBottom: "2px", marginBottom: "4px", fontSize: "10px" }}>
          <span>Page No. 1 of 1</span>
          <span style={{ fontWeight: "bold", fontSize: "12px" }}>QUOTATION</span>
          <span>Original Copy</span>
        </div>

        {/* Company Header */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "4px" }}>
          <tbody>
            <tr>
              <td style={{ width: "70px", verticalAlign: "middle", border: "1px solid #000", padding: "4px", textAlign: "center" }}>
                <div style={{ border: "1px dashed #999", width: "56px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#999", margin: "auto" }}>
                  Add<br />Logo
                </div>
              </td>
              <td style={{ verticalAlign: "middle", textAlign: "center", border: "1px solid #000", padding: "4px" }}>
                <div style={{ fontWeight: "900", fontSize: "18px", letterSpacing: "0.5px" }}>{company.name || "SURAJ ENTERPRISES"}</div>
                <div style={{ fontWeight: "bold", fontSize: "11px" }}>{company.subtitle || "ENGINEERS & CONSULTANTS"}</div>
                <div style={{ fontSize: "9px", color: "#333" }}>{company.description}</div>
                <div style={{ fontSize: "9px" }}>{company.address}</div>
                <div style={{ fontSize: "9px" }}>Mobile: {company.mobile} | Email: {company.email}</div>
                <div style={{ fontSize: "9px", fontWeight: "bold" }}>
                  GSTIN - {company.gstin} | PAN - {company.pan}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Quotation Details + Validity */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "4px", fontSize: "10px" }}>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "4px", width: "50%", verticalAlign: "top" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                  <tbody>
                    {[
                      ["Quotation Number", quotation.number],
                      ["Quotation Date", formatDate(quotation.date)],
                      ["Valid Until", formatDate(quotation.validUntil)],
                      ["Sales Person", quotation.salesperson],
                      ["Place of Supply", quotation.placeOfSupply || "07 - Delhi"],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={{ paddingBottom: "2px", width: "120px", fontWeight: "bold" }}>{label}</td>
                        <td style={{ paddingBottom: "2px" }}>: {value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
              <td style={{ border: "1px solid #000", padding: "4px", width: "50%", verticalAlign: "top" }}>
                <div style={{ fontWeight: "bold", fontSize: "10px", marginBottom: "4px", borderBottom: "1px solid #ccc", paddingBottom: "2px" }}>BILLING DETAILS</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                  <tbody>
                    {[
                      ["Name", billing.name],
                      ["GSTIN", billing.gstin],
                      ["Mobile", billing.mobile],
                      ["Email", billing.email],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <tr key={label}>
                        <td style={{ paddingBottom: "2px", width: "50px", fontWeight: "bold" }}>{label}</td>
                        <td style={{ paddingBottom: "2px" }}>: {value}</td>
                      </tr>
                    ))}
                    {billing.address && (
                      <tr>
                        <td colSpan={2} style={{ paddingTop: "2px", fontSize: "9px" }}>{billing.address}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Items Table */}
        <table className="tally-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", flex: 1 }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              {["Sr. No.", "Description of Goods and Services", "HSN/SAC", "Qty", "Unit", "Rate", "Disc.(₹)", "Amount (₹)"].map((h, i) => (
                <th key={i} style={{ border: "1px solid #000", padding: "3px 4px", textAlign: i === 0 ? "center" : i >= 5 ? "right" : "left", fontWeight: "bold", fontSize: "9px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedItems.map((item, idx) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "center" }}>{idx + 1}</td>
                <td style={{ border: "1px solid #000", padding: "3px 4px" }}>{item.description}</td>
                <td style={{ border: "1px solid #000", padding: "3px 4px" }}>{item.hsnSac}</td>
                <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right" }}>{formatCurrency(item.qty)}</td>
                <td style={{ border: "1px solid #000", padding: "3px 4px" }}>{item.unit || "Nos"}</td>
                <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right" }}>{formatCurrency(item.listPrice)}</td>
                <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right" }}>{item.discRupees > 0 ? formatCurrency(item.discRupees) : ""}</td>
                <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right" }}>{formatCurrency(item.taxableAmount)}</td>
              </tr>
            ))}
            {/* Filler rows */}
            {Array.from({ length: Math.max(0, 4 - processedItems.length) }).map((_, i) => (
              <tr key={"filler-" + i} style={{ height: "22px" }}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} style={{ border: "1px solid #000", padding: "3px 4px" }}>&nbsp;</td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right", fontWeight: "bold" }}>Total</td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right", fontWeight: "bold" }}>{formatCurrency(totalQty)}</td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", fontWeight: "bold" }}>Nos</td>
              <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 4px" }}></td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right", fontWeight: "bold" }}>Rs. {formatCurrency(grandTotal)}</td>
            </tr>
            {/* Tax summary rows */}
            <tr>
              <td colSpan={7} style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right", fontSize: "9px" }}>Subtotal</td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right", fontSize: "9px" }}>{formatCurrency(subTotal)}</td>
            </tr>
            <tr>
              <td colSpan={7} style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right", fontSize: "9px" }}>CGST @ 9%</td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right", fontSize: "9px" }}>{formatCurrency(totalCGST)}</td>
            </tr>
            <tr>
              <td colSpan={7} style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right", fontSize: "9px" }}>SGST @ 9%</td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right", fontSize: "9px" }}>{formatCurrency(totalSGST)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Amount in words */}
        <div style={{ border: "1px solid #000", padding: "4px", fontSize: "9px", marginTop: "-1px" }}>
          <strong>Amount Chargeable (in words)</strong><br />
          Rs. {grandTotalWords} Only
        </div>

        {/* GST Breakup Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px", marginTop: "-1px" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              {["Taxable Value", "GST Type", "Rate", "CGST Amt", "SGST/UTGST Amt", "IGST Amt", "Total Tax"].map((h) => (
                <th key={h} style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "center", fontWeight: "bold" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right" }}>{formatCurrency(subTotal)}</td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "center" }}>CGST+SGST</td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "center" }}>18%</td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right" }}>{formatCurrency(totalCGST)}</td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right" }}>{formatCurrency(totalSGST)}</td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right" }}>–</td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right" }}>{formatCurrency(totalCGST + totalSGST)}</td>
            </tr>
            <tr style={{ fontWeight: "bold" }}>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right" }}>Total: {formatCurrency(subTotal)}</td>
              <td style={{ border: "1px solid #000" }}></td>
              <td style={{ border: "1px solid #000" }}></td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right" }}>{formatCurrency(totalCGST)}</td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right" }}>{formatCurrency(totalSGST)}</td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right" }}>0.00</td>
              <td style={{ border: "1px solid #000", padding: "3px 4px", textAlign: "right" }}>{formatCurrency(totalCGST + totalSGST)}</td>
            </tr>
          </tbody>
        </table>

        {/* Tax Amount in words */}
        <div style={{ border: "1px solid #000", padding: "4px", fontSize: "9px", marginTop: "-1px" }}>
          <strong>Tax Amount (in words)</strong>&nbsp; Rs. {numberToWords ? numberToWords(Math.round(totalCGST + totalSGST)) : ""} Only
        </div>

        {/* Footer */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px", marginTop: "-1px" }}>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "4px", verticalAlign: "top", width: "30%" }}>
                <div style={{ fontWeight: "bold", marginBottom: "3px", textDecoration: "underline" }}>TERMS AND CONDITIONS</div>
                {terms.map((t, i) => (
                  <div key={i} style={{ marginBottom: "2px" }}>{i + 1}. {t}</div>
                ))}
              </td>
              <td style={{ border: "1px solid #000", padding: "4px", verticalAlign: "top", width: "30%" }}>
                {bank.accountNumber && (
                  <>
                    <div>Account Number:{bank.accountNumber}</div>
                    <div>Bank:{bank.name}</div>
                    <div>IFSC:{bank.ifsc}</div>
                  </>
                )}
              </td>
              <td style={{ border: "1px solid #000", padding: "4px", verticalAlign: "top", width: "20%", textAlign: "center" }}>
                <div style={{ fontWeight: "bold", marginBottom: "2px" }}>Validity</div>
                <div>{formatDate(quotation.date)} to {formatDate(quotation.validUntil)}</div>
              </td>
              <td style={{ border: "1px solid #000", padding: "4px", verticalAlign: "top", width: "20%", textAlign: "center" }}>
                <div style={{ fontWeight: "bold" }}>For {company.name || "SURAJ ENTERPRISES"}</div>
                <div style={{ fontSize: "8px", marginTop: "8px", color: "#555" }}>
                  This is a computer generated quotation.
                </div>
                <div style={{ fontSize: "8px", color: "#555" }}>Authorised Signatory</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer Credit */}
        <div style={{ textAlign: "center", fontSize: "8px", color: "#666", padding: "3px", borderTop: "1px solid #eee" }}>
          Quotation Created by {footerCreatedBy}
        </div>
      </div>
    </div>
  );
}
