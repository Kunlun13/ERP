import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import reportCardCss from '../components/reports/studentReportCard.css?inline';

/**
 * Export final report card PDF — A4, multi-page if needed.
 */
export const exportElementToPDF = async (element, filename = 'report.pdf') => {
  if (!element) throw new Error('Element not found');

  const clone = element.cloneNode(true);
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.width = '210mm';
  clone.style.background = '#ffffff';
  document.body.appendChild(clone);

  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: clone.scrollWidth,
  });

  document.body.removeChild(clone);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pdfWidth - margin * 2;

  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const pageContentHeight = pdfHeight - margin * 2;

  let heightLeft = imgHeight;
  let position = 0;
  let page = 0;

  while (heightLeft > 0) {
    if (page > 0) pdf.addPage();
    const sliceHeight = Math.min(pageContentHeight, heightLeft);
    const sourceY = (position / imgHeight) * canvas.height;
    const sourceHeight = (sliceHeight / imgHeight) * canvas.height;

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sourceHeight;
    const ctx = pageCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);

    const pageImg = pageCanvas.toDataURL('image/png');
    pdf.addImage(pageImg, 'PNG', margin, margin, imgWidth, sliceHeight);

    position += sliceHeight;
    heightLeft -= sliceHeight;
    page += 1;
  }

  pdf.save(filename);
};

export const printReportCard = (element) => {
  if (!element) return;
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<title>Student Report</title>
<style>${reportCardCss}</style>
</head><body>${element.outerHTML}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 500);
};

/** @deprecated use printReportCard */
export const printElement = printReportCard;
