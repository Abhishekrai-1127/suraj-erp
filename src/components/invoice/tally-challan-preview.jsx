"use client";

import React from "react";
import "./tally-invoice.css";

export default function TallyChallanPreview({ data }) {
  if (!data) return null;

  const {
    company = {
      name: "SURAJ ENTERPRISES",
      subtitle: "ENGINEERS & CONSULTANTS",
      description:
        "Industrial Items : High Pressure Blowers, I.D./F.D. Fan Blowers, Burners, Heating Pumping Units, Axial Flow Fan, Butterfly Valve, Boilers etc.",
      address: "Street No. 3, B-195, Plot Pyrelal, Libas Pur Road, Samay Pur, Opp. Allahabad Bank, Delhi-42",
      mobile: "+91 9811796630",
      email: "surajenterprises@gmail.com",
    },
    challan = {},
    customer = {},
    items = [],
  } = data;

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

  const processedItems = items.length > 0 ? items : [
    { description: "10 H.P Blower with 1440 RPM Motor.", qty: 1, unit: "Nos", note: "Motor For Party" }
  ];

  return (
    <div
      className="invoice-container challan-container"
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#ffffff",
        color: "#000000",
        padding: "16px",
        width: "794px",
        boxSizing: "border-box",
        border: "2px solid #000000",
        margin: "0 auto",
      }}
    >
      {/* Header Section */}
      <div style={{ textAlign: "center", borderBottom: "2px solid #000000", paddingBottom: "8px", marginBottom: "8px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "900",
            color: "#b91c1c",
            margin: "0",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          {company.name}
        </h1>
        <h2 style={{ fontSize: "12px", fontWeight: "bold", margin: "2px 0 4px 0", color: "#000000" }}>
          {company.subtitle}
        </h2>
        <p style={{ fontSize: "9.5px", margin: "2px 0", color: "#222222", lineHeight: "1.2" }}>
          {company.description}
        </p>
        <p style={{ fontSize: "10px", fontWeight: "bold", margin: "4px 0 0 0", color: "#000000" }}>
          {company.address}
        </p>
        {company.mobile && (
          <p style={{ fontSize: "9px", margin: "2px 0 0 0", color: "#333333" }}>
            Mobile: {company.mobile} | Email: {company.email}
          </p>
        )}
      </div>

      {/* Title & Metadata Header Block */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #000000", paddingBottom: "6px", marginBottom: "8px" }}>
        <div style={{ fontSize: "12px", fontWeight: "bold" }}>
          Challan No. <span style={{ textDecoration: "underline", marginLeft: "4px", fontSize: "13px", fontWeight: "900" }}>{challan.number || "694"}</span>
        </div>
        <div style={{ fontSize: "14px", fontWeight: "900", letterSpacing: "1px", textDecoration: "underline" }}>
          DELIVERY CHALLAN
        </div>
        <div style={{ fontSize: "12px", fontWeight: "bold" }}>
          Dated: <span style={{ textDecoration: "underline", marginLeft: "4px" }}>{formatDate(challan.date) || "12-May-2024"}</span>
        </div>
      </div>

      {/* Customer Info & Order details */}
      <div style={{ marginBottom: "10px", fontSize: "11px", lineHeight: "1.6" }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontWeight: "bold", width: "45px" }}>M/s.</span>
          <span
            style={{
              flex: 1,
              borderBottom: "1px dotted #000000",
              fontWeight: "bold",
              fontSize: "12px",
              paddingLeft: "4px",
            }}
          >
            {customer.name || "Ushma Engineers"}
          </span>
        </div>
        {customer.address && (
          <div style={{ display: "flex", alignItems: "baseline", marginTop: "4px" }}>
            <span style={{ width: "45px" }}></span>
            <span
              style={{
                flex: 1,
                borderBottom: "1px dotted #000000",
                fontSize: "11px",
                paddingLeft: "4px",
              }}
            >
              {customer.address}
            </span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "baseline", marginTop: "6px" }}>
          <span style={{ fontWeight: "bold" }}>Party's Order No. & Date:</span>
          <span
            style={{
              flex: 1,
              borderBottom: "1px dotted #000000",
              paddingLeft: "8px",
              fontWeight: "600",
            }}
          >
            {challan.partyOrderNo || "PO-88912-X"}
          </span>
        </div>
      </div>

      {/* Instructions Line */}
      <div style={{ fontSize: "10px", fontStyle: "italic", marginBottom: "6px", fontWeight: "bold" }}>
        Please receive the following goods in order:
      </div>

      {/* Particulars Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #000000",
          fontSize: "11px",
          minHeight: "380px",
        }}
      >
        <thead>
          <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #000000" }}>
            <th style={{ borderRight: "1px solid #000000", padding: "6px 8px", width: "50px", textAlign: "center", fontWeight: "bold" }}>
              S. No.
            </th>
            <th style={{ borderRight: "1px solid #000000", padding: "6px 8px", width: "100px", textAlign: "center", fontWeight: "bold" }}>
              Quantity
            </th>
            <th style={{ padding: "6px 12px", textAlign: "center", fontWeight: "900", letterSpacing: "2px" }}>
              P A R T I C U L A R S
            </th>
          </tr>
        </thead>
        <tbody>
          {processedItems.map((item, idx) => (
            <tr key={idx} style={{ verticalAlign: "top" }}>
              <td style={{ borderRight: "1px solid #000000", padding: "8px", textAlign: "center", fontWeight: "bold" }}>
                {idx + 1}.
              </td>
              <td style={{ borderRight: "1px solid #000000", padding: "8px", textAlign: "center", fontWeight: "bold" }}>
                {item.qty} {item.unit || "Nos"}
              </td>
              <td style={{ padding: "8px 12px" }}>
                <div style={{ fontWeight: "bold", fontSize: "12px", color: "#000000" }}>{item.description}</div>
                {item.note && (
                  <div style={{ marginTop: "6px", fontStyle: "italic", fontSize: "11px", color: "#333333" }}>
                    {item.note}
                  </div>
                )}
              </td>
            </tr>
          ))}

          {/* Filler space matching physical challan pad */}
          <tr style={{ height: "260px" }}>
            <td style={{ borderRight: "1px solid #000000" }}></td>
            <td style={{ borderRight: "1px solid #000000" }}></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* Footer Section */}
      <div
        style={{
          display: "flex",
          justify: "space-between",
          alignItems: "flex-end",
          marginTop: "24px",
          paddingTop: "8px",
          borderTop: "1px solid #000000",
          fontSize: "11px",
        }}
      >
        <div style={{ width: "50%" }}>
          <div style={{ marginBottom: "35px", fontStyle: "italic", fontSize: "10px" }}>
            Received the goods in good condition.
          </div>
          <div style={{ borderTop: "1px solid #000000", width: "180px", textAlign: "center", paddingTop: "4px", fontWeight: "bold" }}>
            Customer's Signature
          </div>
        </div>

        <div style={{ width: "40%", textAlign: "right" }}>
          <div style={{ fontWeight: "bold", marginBottom: "40px", fontSize: "12px" }}>
            For {company.name}
          </div>
          <div style={{ borderTop: "1px solid #000000", width: "180px", marginLeft: "auto", textAlign: "center", paddingTop: "4px", fontWeight: "bold" }}>
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
}
