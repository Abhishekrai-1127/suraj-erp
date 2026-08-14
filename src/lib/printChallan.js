import React from "react";
import { createRoot } from "react-dom/client";
import TallyChallanPreview from "@/components/invoice/tally-challan-preview";

const DEFAULT_COMPANY = {
  name: "SURAJ ENTERPRISES",
  subtitle: "ENGINEERS & CONSULTANTS",
  description:
    "Industrial Items : High Pressure Blowers, I.D./F.D. Fan Blowers, Burners, Heating Pumping Units, Axial Flow Fan, Butterfly Valve, Boilers etc.",
  address: "Street No. 3, B-195, Plot Pyrelal, Libas Pur Road, Samay Pur, Opp. Allahabad Bank, Delhi-42",
  mobile: "+91 9811796630",
  email: "surajenterprises@gmail.com",
};

function mapErpChallanToPreview(erpChallan) {
  const refNo = erpChallan.id || erpChallan.refNo || "DC-2024-001";
  const customerName = erpChallan.customer || erpChallan.customerName || "Acme Corp Ltd";
  const customerAddress = erpChallan.address || erpChallan.billingAddress || "Gali No. 6, Master Mohalla, Libaspur, Delhi-42";

  return {
    company: DEFAULT_COMPANY,
    challan: {
      number: refNo,
      date: erpChallan.date || erpChallan.dispatchDate || new Date().toISOString().split("T")[0],
      partyOrderNo: erpChallan.partyOrderNo || erpChallan.poNumber || "PO-88912-X",
    },
    customer: {
      name: customerName,
      address: customerAddress,
    },
    items:
      erpChallan.items && erpChallan.items.length > 0
        ? erpChallan.items.map((item) => ({
            description: item.description || "Industrial Goods",
            qty: item.qty || item.quantity || 1,
            unit: item.unit || "Nos",
            note: item.note || "",
          }))
        : [
            {
              description: "10 H.P Blower with 1440 RPM Motor.",
              qty: 1,
              unit: "Nos",
              note: "Motor For Party",
            },
          ],
  };
}

export async function downloadChallanPDF(erpChallan) {
  const previewData = mapErpChallanToPreview(erpChallan);
  const challanNum = previewData.challan?.number || "Challan";
  const filename = `${challanNum.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

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
      root.render(<TallyChallanPreview data={previewData} />);
      setTimeout(resolve, 700);
    });

    const challanEl = container.querySelector(".challan-container") || container;
    challanEl.style.boxShadow = "none";
    challanEl.style.margin = "0";

    const html2canvasModule = await import("html2canvas");
    const html2canvas = html2canvasModule.default || html2canvasModule;

    const jsPDFModule = await import("jspdf");
    const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;

    const canvas = await html2canvas(challanEl, {
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
        uploadPdfToCloudStorage(pdfBlob, challanNum, "challan");
      });
    } catch (e) {
      console.warn("Cloud PDF upload info:", e);
    }

    root.unmount();
  } catch (err) {
    console.error("Challan PDF download failed:", err);
    throw err;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
