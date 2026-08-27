import type { Paragraph as ParagraphType } from "docx";
import type { Deliverable } from "./types";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadText(text: string, filename: string) {
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
}

async function exportDocx(deliverable: Deliverable) {
  const { Document, Packer, Paragraph, HeadingLevel } = await import("docx");
  const title = deliverable.name.replace(/\.[^.]+$/, "").replace(/_/g, " ");
  const children: ParagraphType[] = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE, spacing: { after: 160 } }),
    new Paragraph({ text: deliverable.summary, spacing: { after: 240 } }),
  ];

  for (const section of deliverable.sections ?? []) {
    children.push(new Paragraph({ text: section.heading, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
    for (const line of section.body.split("\n")) {
      children.push(new Paragraph({ text: line, spacing: { after: 80 } }));
    }
  }

  const doc = new Document({ sections: [{ properties: {}, children }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, deliverable.name);
}

async function exportPptx(deliverable: Deliverable) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();

  for (const section of deliverable.sections ?? []) {
    const slide = pptx.addSlide();
    const cleanTitle = section.heading.replace(/^Slide \d+\s*·\s*/, "");
    slide.background = { color: "FFFFFF" };
    slide.addText(cleanTitle, {
      x: 0.5, y: 0.4, w: 9, h: 0.8,
      fontSize: 26, bold: true, color: "1A2E1E", fontFace: "Arial",
    });
    slide.addShape("rect", { x: 0.5, y: 1.15, w: 1.3, h: 0.04, fill: { color: "D17C2C" } });
    slide.addText(section.body, {
      x: 0.5, y: 1.5, w: 9, h: 3.6,
      fontSize: 14, color: "333333", fontFace: "Arial", valign: "top",
    });
    slide.addText(deliverable.name, {
      x: 0.5, y: 5.2, w: 9, h: 0.3,
      fontSize: 9, color: "9AA294", fontFace: "Arial",
    });
  }

  await pptx.writeFile({ fileName: deliverable.name });
}

function exportCode(deliverable: Deliverable) {
  downloadText(deliverable.code ?? "", deliverable.name);
}

export async function exportDeliverable(deliverable: Deliverable) {
  if (deliverable.type === "docx") return exportDocx(deliverable);
  if (deliverable.type === "pptx") return exportPptx(deliverable);
  return exportCode(deliverable);
}

export function exportSourceFile(filename: string, content: string) {
  downloadText(content, filename);
}
