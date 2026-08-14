import React from "react";
import { createRoot } from "react-dom/client";
import TallyQuotationPreview from "@/components/invoice/tally-quotation-preview";

// Default company + terms data
const DEFAULT_COMPANY = {
  name: "SURAJ ENTERPRISES",
  subtitle: "ENGINEERS & CONSULTANTS",
  description:
    "Industrial Items : High Pressure Blowers, I.D./F.D. Fan Blowers, Burners, Heating Pumping Units, Axial Flow Fan, Butterfly Valve, Boilers etc.",
  address: "Gali No. 3, Village Libaspur City, Near Payare Lal Compound, Delhi-110042",
  mobile: "+91 9811796630",
  email: "surajenterprises@gmail.com",
  gstin: "07AVPPS1373Q1ZM",
  pan: "AVPPS1373Q",
};

const DEFAULT_BANK = {
  accountNumber: "629705017715",
  name: "ICICI BANK",
  ifsc: "ICICI0006297",
};

const DEFAULT_TERMS = [
  "E & O.E",
  "Our responsibility ceases after delivery of goods from our premises.",
  "Goods once sold cannot be taken back.",
  "Subject to Delhi Jurisdiction.",
];

/**
 * Map a stored ERP quotation row → TallyQuotationPreview data shape
 */
function mapErpQuotationToTally(erpQuotation) {
  const refNo = erpQuotation.id || erpQuotation.refNo || "QT-2024-001";
  const customerName = erpQuotation.customer || "Customer";
  const rawAmount =
    typeof erpQuotation.numericAmount === "number"
      ? erpQuotation.numericAmount
      : parseFloat(String(erpQuotation.amount || "0").replace(/[^0-9.]/g, "")) || 0;

  return {
    company: DEFAULT_COMPANY,
    quotation: {
      number: refNo,
      date: erpQuotation.date || new Date().toISOString().split("T")[0],
      validUntil: erpQuotation.validUntil || erpQuotation.expiryDate || "",
      salesperson: erpQuotation.salesPerson || "Sarah Chen",
      placeOfSupply: "07 - Delhi",
    },
    billing: {
      name: customerName,
      gstin: erpQuotation.gstin || "",
      mobile: erpQuotation.mobile || "",
      email: erpQuotation.email || "",
      address: erpQuotation.billingAddress || "",
    },
    items:
      erpQuotation.items && erpQuotation.items.length > 0
        ? erpQuotation.items.map((item) => ({
            description: item.description || "Item",
            hsnSac: item.hsnSac || "84145930",
            qty: parseFloat(item.qty || item.quantity || 1),
            unit: item.unit || "Nos",
            listPrice: parseFloat(item.listPrice || item.unitPrice || item.rate || 0),
            discRupees: parseFloat(item.discRupees || item.discount || 0),
            taxPercent: parseFloat(item.taxPercent || item.tax || 18),
          }))
        : [
            {
              description: erpQuotation.description || "Industrial Machinery Equipment & Components",
              hsnSac: "84145930",
              qty: 1,
              unit: "Nos",
              listPrice: rawAmount / 1.18,
              discRupees: 0,
              taxPercent: 18,
            },
          ],
    flatDiscount: 0,
    bank: DEFAULT_BANK,
    terms: DEFAULT_TERMS,
    footerCreatedBy: "Suraj ERP",
  };
}

/**
 * Download a quotation as a single-page PDF
 */
export async function downloadQuotationPDF(erpQuotation) {
  const tallyData = mapErpQuotationToTally(erpQuotation);
  const quotationNum = tallyData.quotation?.number || "Quotation";
  const filename = `${quotationNum.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.height = "auto";
  container.style.overflow = "visible";
  container.style.backgroundColor = "#ffffff";
  container.style.boxSizing = "border-box";
  container.style.padding = "0";
  container.style.margin = "0";
  document.body.appendChild(container);

  try {
    const root = createRoot(container);

    await new Promise((resolve) => {
      root.render(<TallyQuotationPreview data={tallyData} />);
      setTimeout(resolve, 700);
    });

    const invoiceEl = container.querySelector(".invoice-container") || container;
    invoiceEl.style.boxShadow = "none";
    invoiceEl.style.margin = "0";

    const html2canvasModule = await import("html2canvas");
    const html2canvas = html2canvasModule.default || html2canvasModule;

    const jsPDFModule = await import("jspdf");
    const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;

    const canvas = await html2canvas(invoiceEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);

    const pageW = 210;
    const pageH = 297;
    const imgH = (canvas.height / canvas.width) * pageW;

    let pdf;
    if (imgH <= pageH) {
      pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "JPEG", 0, 0, pageW, imgH);
    } else {
      pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [pageW, imgH] });
      pdf.addImage(imgData, "JPEG", 0, 0, pageW, imgH);
    }

    pdf.save(filename);

    // Upload generated PDF to Firebase Cloud Storage asynchronously
    try {
      const pdfBlob = pdf.output("blob");
      import("./erp-storage").then(({ uploadPdfToCloudStorage }) => {
        uploadPdfToCloudStorage(pdfBlob, quotationNum, "quotation");
      });
    } catch (e) {
      console.warn("Cloud PDF upload info:", e);
    }

    root.unmount();
  } catch (err) {
    console.error("Quotation PDF download failed:", err);
    throw err;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
