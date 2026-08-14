import React from "react";
import { createRoot } from "react-dom/client";
import { mapErpInvoiceToTally, initialInvoiceData } from "./invoiceData";
import TallyInvoicePreview from "@/components/invoice/tally-invoice-preview";

export function openInvoiceInNewTab(erpInvoice) {
  const tallyData = mapErpInvoiceToTally(erpInvoice || initialInvoiceData);
  
  try {
    localStorage.setItem("active_tally_print_invoice", JSON.stringify(tallyData));
  } catch (e) {
    console.error("Failed to store print invoice in localStorage", e);
  }

  const printWindow = window.open("/print-invoice", "_blank");
  if (printWindow) {
    printWindow.focus();
  }
}

export async function downloadInvoicePDF(erpInvoice) {
  const tallyData = mapErpInvoiceToTally(erpInvoice || initialInvoiceData);
  const invoiceNum = tallyData.invoice?.number || "Invoice";
  const filename = `${invoiceNum.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

  // Offscreen container — NO fixed height so invoice renders at its natural full height
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

    // Render the invoice and wait for fonts/images to settle
    await new Promise((resolve) => {
      root.render(<TallyInvoicePreview data={tallyData} />);
      setTimeout(resolve, 700);
    });

    // Target the invoice element specifically (strip shadow & margin for clean capture)
    const invoiceEl = container.querySelector(".invoice-container") || container;
    invoiceEl.style.boxShadow = "none";
    invoiceEl.style.margin = "0";

    const html2canvasModule = await import("html2canvas");
    const html2canvas = html2canvasModule.default || html2canvasModule;

    const jsPDFModule = await import("jspdf");
    const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;

    // Capture at scale:2 for sharpness — let html2canvas measure element's natural size
    const canvas = await html2canvas(invoiceEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: -window.scrollY, // compensate page scroll
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);

    // A4 page constants (mm)
    const pageW = 210;
    const pageH = 297;

    // Scale image to full A4 width and compute proportional height
    const imgH = (canvas.height / canvas.width) * pageW;

    let pdf;
    if (imgH <= pageH) {
      // Invoice fits on one A4 page — align to top
      pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "JPEG", 0, 0, pageW, imgH);
    } else {
      // Invoice is taller than A4 — create a custom-height page so nothing is cut
      pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pageW, imgH],
      });
      pdf.addImage(imgData, "JPEG", 0, 0, pageW, imgH);
    }

    pdf.save(filename);

    // Upload generated PDF to Firebase Cloud Storage asynchronously
    try {
      const pdfBlob = pdf.output("blob");
      import("./erp-storage").then(({ uploadPdfToCloudStorage }) => {
        uploadPdfToCloudStorage(pdfBlob, invoiceNum, "invoice");
      });
    } catch (e) {
      console.warn("Cloud PDF upload info:", e);
    }

    root.unmount();
  } catch (err) {
    console.error("PDF download failed, falling back to print view", err);
    openInvoiceInNewTab(erpInvoice);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
