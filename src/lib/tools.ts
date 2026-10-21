// Every tool the site offers, one per Gotenberg feature. This file is shared by
// the UI, the API proxy, the docs page and the sitemap, so adding a tool here
// gives it a landing page, an API endpoint and an SEO entry at once.

export type FieldType = "text" | "number" | "select" | "checkbox" | "textarea" | "password";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
  default?: string | boolean;
  required?: boolean;
  advanced?: boolean;
  // Virtual fields are read by the server and turned into real Gotenberg fields.
  virtual?: boolean;
};

export type Input =
  | { kind: "files"; accept: string; multiple: boolean; min?: number; label: string }
  | { kind: "url" }
  | { kind: "html" }
  | { kind: "markdown" };

export type ExtraFile = { name: string; label: string; accept: string; multiple: boolean; required?: boolean };

export type Category = "convert" | "edit" | "secure" | "capture" | "inspect";

export type Tool = {
  slug: string;
  name: string;
  category: Category;
  title: string;
  description: string;
  intro: string;
  route: string;
  input: Input;
  extraFiles?: ExtraFile[];
  fields: Field[];
  fixed?: Record<string, string>;
  output: "pdf" | "zip" | "image" | "json" | "pdf-or-zip";
  steps: string[];
  faq: { q: string; a: string }[];
};

export const categories: Record<Category, string> = {
  convert: "Convert to PDF",
  edit: "Edit & organize",
  secure: "Protect",
  capture: "Screenshots",
  inspect: "Inspect",
};

const paperSize: Field = {
  name: "paperSize",
  label: "Paper size",
  type: "select",
  virtual: true,
  default: "8.27x11.7",
  options: [
    { value: "8.27x11.7", label: "A4" },
    { value: "8.5x11", label: "Letter" },
    { value: "8.5x14", label: "Legal" },
    { value: "11.7x16.54", label: "A3" },
    { value: "5.83x8.27", label: "A5" },
    { value: "11x17", label: "Tabloid" },
  ],
};

const margin: Field = {
  name: "margin",
  label: "Margins",
  type: "select",
  virtual: true,
  default: "0.39",
  options: [
    { value: "0", label: "None" },
    { value: "0.2", label: "Narrow" },
    { value: "0.39", label: "Normal" },
    { value: "1", label: "Wide" },
  ],
};

const chromiumPdfFields: Field[] = [
  paperSize,
  margin,
  { name: "landscape", label: "Landscape", type: "checkbox", default: false },
  { name: "printBackground", label: "Print backgrounds", type: "checkbox", default: true },
  { name: "singlePage", label: "Fit everything on one long page", type: "checkbox", default: false, advanced: true },
  { name: "scale", label: "Scale", type: "number", default: "1", help: "0.1 to 2", advanced: true },
  { name: "nativePageRanges", label: "Pages to keep", type: "text", placeholder: "1-3, 5", advanced: true },
  {
    name: "emulatedMediaType",
    label: "CSS media",
    type: "select",
    default: "print",
    advanced: true,
    options: [
      { value: "print", label: "Print" },
      { value: "screen", label: "Screen" },
    ],
  },
  {
    name: "waitDelay",
    label: "Wait before capture",
    type: "select",
    default: "",
    advanced: true,
    options: [
      { value: "", label: "No delay" },
      { value: "1s", label: "1 second" },
      { value: "3s", label: "3 seconds" },
      { value: "5s", label: "5 seconds" },
    ],
  },
  { name: "generateDocumentOutline", label: "Build bookmarks from headings", type: "checkbox", default: false, advanced: true },
];

const pdfa: Field = {
  name: "pdfa",
  label: "PDF/A archive format",
  type: "select",
  default: "",
  advanced: true,
  options: [
    { value: "", label: "Off" },
    { value: "PDF/A-1b", label: "PDF/A-1b" },
    { value: "PDF/A-2b", label: "PDF/A-2b" },
    { value: "PDF/A-3b", label: "PDF/A-3b" },
  ],
};

const officeFields: Field[] = [
  { name: "landscape", label: "Landscape", type: "checkbox", default: false },
  { name: "merge", label: "Merge into one PDF", type: "checkbox", default: true, help: "When you upload several files" },
  { name: "nativePageRanges", label: "Pages to keep", type: "text", placeholder: "1-3, 5", advanced: true },
  { name: "singlePageSheets", label: "One page per sheet (spreadsheets)", type: "checkbox", default: false, advanced: true },
  { name: "quality", label: "Image quality", type: "number", default: "90", help: "1 to 100", advanced: true },
  { name: "password", label: "Password of the source file", type: "password", advanced: true },
  pdfa,
];

const screenshotFields: Field[] = [
  { name: "width", label: "Viewport width (px)", type: "number", default: "1280" },
  { name: "height", label: "Viewport height (px)", type: "number", default: "800" },
  {
    name: "format",
    label: "Format",
    type: "select",
    default: "png",
    options: [
      { value: "png", label: "PNG" },
      { value: "jpeg", label: "JPEG" },
      { value: "webp", label: "WebP" },
    ],
  },
  { name: "clip", label: "Only the visible viewport (not the full page)", type: "checkbox", default: false },
  {
    name: "deviceScaleFactor",
    label: "Pixel density",
    type: "select",
    default: "1",
    advanced: true,
    options: [
      { value: "1", label: "1x" },
      { value: "2", label: "2x (retina)" },
    ],
  },
  { name: "quality", label: "JPEG quality", type: "number", default: "90", advanced: true },
  { name: "selector", label: "Capture only this CSS selector", type: "text", placeholder: "#main", advanced: true },
  { name: "omitBackground", label: "Transparent background", type: "checkbox", default: false, advanced: true },
  {
    name: "waitDelay",
    label: "Wait before capture",
    type: "select",
    default: "",
    advanced: true,
    options: [
      { value: "", label: "No delay" },
      { value: "1s", label: "1 second" },
      { value: "3s", label: "3 seconds" },
    ],
  },
];

const pdfInput = (multiple = false, min = 1): Input => ({
  kind: "files",
  accept: ".pdf,application/pdf",
  multiple,
  min,
  label: multiple ? "PDF files" : "PDF file",
});

const officeFaq = (thing: string) => [
  { q: `Will my ${thing} look the same as a PDF?`, a: "Yes. Files are converted with LibreOffice, which keeps fonts, tables, images and page layout as close to the original as possible." },
  { q: "Are my files stored?", a: "No. Files are converted in memory and deleted as soon as the PDF is sent back to you." },
  { q: "Can I convert several files at once?", a: "Yes. Upload several files and choose whether to merge them into one PDF or get a ZIP of separate PDFs." },
];

export const tools: Tool[] = [
  {
    slug: "word-to-pdf",
    name: "Word to PDF",
    category: "convert",
    title: "Word to PDF Converter – Convert DOCX to PDF Online",
    description: "Convert Word documents (DOC, DOCX, ODT, RTF) to PDF online in seconds. Keeps your fonts and layout. Free to try, no install.",
    intro: "Turn DOC, DOCX, ODT and RTF documents into clean, print-ready PDFs that look exactly like the original.",
    route: "libreoffice/convert",
    input: { kind: "files", accept: ".doc,.docx,.odt,.rtf,.txt,.dotx,.docm", multiple: true, label: "Word documents" },
    fields: officeFields,
    output: "pdf-or-zip",
    steps: ["Upload one or more Word files.", "Pick orientation and options.", "Download your PDF."],
    faq: officeFaq("Word document"),
  },
  {
    slug: "excel-to-pdf",
    name: "Excel to PDF",
    category: "convert",
    title: "Excel to PDF Converter – Convert XLSX Spreadsheets to PDF",
    description: "Convert Excel spreadsheets (XLS, XLSX, ODS, CSV) to PDF online. Fit each sheet on one page. Fast, accurate and free to try.",
    intro: "Convert XLS, XLSX, ODS and CSV spreadsheets to PDF, with the option to fit each sheet on a single page.",
    route: "libreoffice/convert",
    input: { kind: "files", accept: ".xls,.xlsx,.ods,.csv,.xlsm", multiple: true, label: "Spreadsheets" },
    fields: officeFields,
    output: "pdf-or-zip",
    steps: ["Upload your spreadsheet.", "Turn on “One page per sheet” for wide tables.", "Download your PDF."],
    faq: officeFaq("spreadsheet"),
  },
  {
    slug: "powerpoint-to-pdf",
    name: "PowerPoint to PDF",
    category: "convert",
    title: "PowerPoint to PDF Converter – Convert PPTX to PDF Online",
    description: "Convert PowerPoint presentations (PPT, PPTX, ODP) to PDF online. Every slide preserved. Free to try.",
    intro: "Convert PPT, PPTX and ODP presentations to PDF so anyone can open your slides on any device.",
    route: "libreoffice/convert",
    input: { kind: "files", accept: ".ppt,.pptx,.odp,.pps,.ppsx", multiple: true, label: "Presentations" },
    fields: officeFields,
    output: "pdf-or-zip",
    steps: ["Upload your presentation.", "Choose options.", "Download the PDF with every slide."],
    faq: officeFaq("presentation"),
  },
  {
    slug: "office-to-pdf",
    name: "Any file to PDF",
    category: "convert",
    title: "Convert Any Document to PDF – 100+ File Formats Supported",
    description: "Convert over 100 document formats to PDF: Word, Excel, PowerPoint, OpenDocument, RTF, TXT, images and more.",
    intro: "One converter for more than 100 formats: Office, OpenDocument, RTF, plain text, images and more.",
    route: "libreoffice/convert",
    input: { kind: "files", accept: "*", multiple: true, label: "Documents" },
    fields: officeFields,
    output: "pdf-or-zip",
    steps: ["Upload any document.", "Choose options.", "Download your PDF."],
    faq: officeFaq("file"),
  },
  {
    slug: "html-to-pdf",
    name: "HTML to PDF",
    category: "convert",
    title: "HTML to PDF Converter – Pixel-Perfect with Chrome",
    description: "Convert HTML and CSS to PDF with a real Chrome browser. Paste code or upload a file. Supports modern CSS, web fonts and JavaScript.",
    intro: "Paste HTML (or upload a file) and get a pixel-perfect PDF rendered by a real Chrome browser.",
    route: "chromium/convert/html",
    input: { kind: "html" },
    fields: chromiumPdfFields.concat(pdfa),
    output: "pdf",
    steps: ["Paste your HTML or upload an .html file.", "Choose paper size and margins.", "Download your PDF."],
    faq: [
      { q: "Does it support modern CSS and JavaScript?", a: "Yes. Pages are rendered by headless Chrome, so flexbox, grid, web fonts and JavaScript all work." },
      { q: "Can I add page breaks?", a: "Use the CSS rule break-after: page (or page-break-after: always) on any element." },
      { q: "Is there an API?", a: "Yes. Pro and Business plans include an API key so you can generate PDFs from your own app." },
    ],
  },
  {
    slug: "url-to-pdf",
    name: "Website to PDF",
    category: "convert",
    title: "Website to PDF – Save Any Web Page as PDF",
    description: "Save any web page as a PDF by pasting its URL. Rendered in Chrome with backgrounds, fonts and images. Free to try.",
    intro: "Paste a link and save the whole web page as a clean PDF, rendered in a real Chrome browser.",
    route: "chromium/convert/url",
    input: { kind: "url" },
    fields: chromiumPdfFields.concat(pdfa),
    output: "pdf",
    steps: ["Paste the page URL.", "Pick paper size, margins and background options.", "Download your PDF."],
    faq: [
      { q: "Can it capture pages behind a login?", a: "No. Only public pages can be converted." },
      { q: "The page looks incomplete. What can I do?", a: "Open Advanced options and add a wait delay so the page has time to load images and scripts." },
    ],
  },
  {
    slug: "markdown-to-pdf",
    name: "Markdown to PDF",
    category: "convert",
    title: "Markdown to PDF Converter – Clean, Styled PDFs from .md",
    description: "Convert Markdown to a nicely styled PDF online. Paste text or upload .md files. Headings, tables, code and lists supported.",
    intro: "Paste Markdown and get a clean, readable PDF with styled headings, tables and code blocks.",
    route: "chromium/convert/markdown",
    input: { kind: "markdown" },
    fields: chromiumPdfFields,
    output: "pdf",
    steps: ["Paste Markdown or upload an .md file.", "Choose paper size.", "Download your PDF."],
    faq: [
      { q: "Which Markdown features are supported?", a: "Headings, lists, links, images, tables, block quotes and code blocks." },
    ],
  },
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    category: "edit",
    title: "Merge PDF – Combine PDF Files Online",
    description: "Combine multiple PDF files into one document in the order you choose. Fast, secure and free to try.",
    intro: "Combine several PDFs into a single document. Files are merged in the order you upload them.",
    route: "pdfengines/merge",
    input: pdfInput(true, 2),
    fields: [
      { name: "titleBookmarks", label: "Add a bookmark for each file", type: "checkbox", default: false },
      { name: "flatten", label: "Flatten form fields", type: "checkbox", default: false, advanced: true },
    ],
    output: "pdf",
    steps: ["Upload two or more PDFs in the order you want.", "Optionally add bookmarks.", "Download the merged PDF."],
    faq: [
      { q: "In which order are files merged?", a: "In the order you add them. Rename files with numbers (01, 02…) to control the order." },
      { q: "Is there a limit on files?", a: "No limit on the number of files, only on total size, which depends on your plan." },
    ],
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    category: "edit",
    title: "Split PDF – Extract Pages or Split into Multiple Files",
    description: "Split a PDF into single pages, fixed-size chunks or extract a page range. Free online PDF splitter.",
    intro: "Break a PDF into chunks of N pages, or pull out exactly the pages you need.",
    route: "pdfengines/split",
    input: pdfInput(),
    fields: [
      {
        name: "splitMode",
        label: "How to split",
        type: "select",
        default: "intervals",
        required: true,
        options: [
          { value: "intervals", label: "Every N pages" },
          { value: "pages", label: "Extract page ranges" },
        ],
      },
      { name: "splitSpan", label: "N pages, or page ranges", type: "text", default: "1", required: true, placeholder: "1  or  1-3,5", help: "A number for “Every N pages”, ranges like 1-3,5 for extraction" },
      { name: "splitUnify", label: "Put extracted pages in one PDF", type: "checkbox", default: true, help: "Only for page ranges" },
    ],
    output: "pdf-or-zip",
    steps: ["Upload your PDF.", "Choose to split every N pages or extract a range.", "Download a ZIP or a single PDF."],
    faq: [{ q: "How do I extract a single page?", a: "Choose “Extract page ranges”, type the page number, and keep “Put extracted pages in one PDF” on." }],
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    category: "edit",
    title: "Compress PDF – Reduce PDF File Size Online",
    description: "Make PDF files smaller by optimizing images. Choose the quality level. Free online PDF compressor.",
    intro: "Shrink PDFs by re-compressing their images, so they are easier to email and upload.",
    route: "pdfengines/merge",
    input: pdfInput(),
    fixed: { optimizeImages: "true" },
    fields: [
      {
        name: "imageQuality",
        label: "Compression",
        type: "select",
        default: "60",
        options: [
          { value: "85", label: "Light (best quality)" },
          { value: "60", label: "Recommended" },
          { value: "35", label: "Strong (smallest file)" },
        ],
      },
    ],
    output: "pdf",
    steps: ["Upload your PDF.", "Pick a compression level.", "Download the smaller PDF."],
    faq: [{ q: "Why didn't my file get much smaller?", a: "Compression mainly shrinks images. PDFs made only of text are already small." }],
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    category: "edit",
    title: "Rotate PDF – Rotate Pages Permanently Online",
    description: "Rotate all or selected PDF pages by 90, 180 or 270 degrees and save the result. Free online tool.",
    intro: "Fix sideways or upside-down scans by rotating every page or just the ones you pick.",
    route: "pdfengines/rotate",
    input: pdfInput(true),
    fields: [
      {
        name: "rotateAngle",
        label: "Rotate by",
        type: "select",
        default: "90",
        required: true,
        options: [
          { value: "90", label: "90° clockwise" },
          { value: "180", label: "180°" },
          { value: "270", label: "90° counter-clockwise" },
        ],
      },
      { name: "rotatePages", label: "Pages (empty = all)", type: "text", placeholder: "1-3, 5" },
    ],
    output: "pdf-or-zip",
    steps: ["Upload your PDF.", "Choose the angle and pages.", "Download the rotated PDF."],
    faq: [{ q: "Is the rotation permanent?", a: "Yes, the pages are saved rotated in the new file." }],
  },
  {
    slug: "watermark-pdf",
    name: "Watermark PDF",
    category: "edit",
    title: "Add Watermark to PDF – Text or Image Watermark Online",
    description: "Add a text or image watermark behind the content of your PDF pages. Choose which pages. Free to try.",
    intro: "Add a text or logo watermark behind your page content, such as “DRAFT” or “CONFIDENTIAL”.",
    route: "pdfengines/watermark",
    input: pdfInput(true),
    extraFiles: [{ name: "watermark", label: "Watermark image (for image watermarks)", accept: "image/png,image/jpeg,.pdf", multiple: false }],
    fields: [
      {
        name: "watermarkSource",
        label: "Watermark type",
        type: "select",
        default: "text",
        required: true,
        options: [
          { value: "text", label: "Text" },
          { value: "image", label: "Image" },
        ],
      },
      { name: "watermarkExpression", label: "Watermark text", type: "text", default: "CONFIDENTIAL", help: "For image watermarks this is set for you" },
      { name: "watermarkPages", label: "Pages (empty = all)", type: "text", placeholder: "1-3, 5" },
    ],
    output: "pdf-or-zip",
    steps: ["Upload your PDF.", "Type your text or upload a logo.", "Download the watermarked PDF."],
    faq: [{ q: "What is the difference between a watermark and a stamp?", a: "A watermark sits behind the page content, a stamp is placed on top of it." }],
  },
  {
    slug: "stamp-pdf",
    name: "Stamp PDF",
    category: "edit",
    title: "Stamp PDF – Add Text or Image Stamp on Top of PDF Pages",
    description: "Stamp text like “APPROVED” or “PAID”, or an image, on top of your PDF pages. Free online PDF stamp tool.",
    intro: "Put a text or image stamp, such as “APPROVED” or “PAID”, on top of your PDF pages.",
    route: "pdfengines/stamp",
    input: pdfInput(true),
    extraFiles: [{ name: "stamp", label: "Stamp image (for image stamps)", accept: "image/png,image/jpeg,.pdf", multiple: false }],
    fields: [
      {
        name: "stampSource",
        label: "Stamp type",
        type: "select",
        default: "text",
        required: true,
        options: [
          { value: "text", label: "Text" },
          { value: "image", label: "Image" },
        ],
      },
      { name: "stampExpression", label: "Stamp text", type: "text", default: "APPROVED", help: "For image stamps this is set for you" },
      { name: "stampPages", label: "Pages (empty = all)", type: "text", placeholder: "1" },
    ],
    output: "pdf-or-zip",
    steps: ["Upload your PDF.", "Type your stamp text or upload an image.", "Download the stamped PDF."],
    faq: [{ q: "Can I stamp only the first page?", a: "Yes. Type 1 in the Pages field." }],
  },
  {
    slug: "protect-pdf",
    name: "Protect PDF",
    category: "secure",
    title: "Password Protect PDF – Encrypt PDF Files Online",
    description: "Add a password to your PDF and control printing, copying and editing permissions. Free online PDF encryption.",
    intro: "Lock a PDF with a password and choose whether people can print, copy or edit it.",
    route: "pdfengines/encrypt",
    input: pdfInput(true),
    fields: [
      { name: "userPassword", label: "Password to open the PDF", type: "password", required: true },
      { name: "ownerPassword", label: "Owner password (to change permissions)", type: "password", help: "Defaults to the open password" },
      { name: "allowPrinting", label: "Allow printing", type: "checkbox", default: true },
      { name: "allowCopying", label: "Allow copying text", type: "checkbox", default: true },
      { name: "allowModifying", label: "Allow editing", type: "checkbox", default: false },
      { name: "allowAnnotating", label: "Allow comments", type: "checkbox", default: true, advanced: true },
      { name: "allowFillingForms", label: "Allow filling forms", type: "checkbox", default: true, advanced: true },
    ],
    output: "pdf-or-zip",
    steps: ["Upload your PDF.", "Set a password and permissions.", "Download the protected PDF."],
    faq: [
      { q: "Do you keep my password?", a: "No. The password is used once to encrypt the file and is never stored." },
      { q: "I forgot the password. Can you unlock it?", a: "No. Encryption is real, so keep your password somewhere safe." },
    ],
  },
  {
    slug: "pdf-to-pdfa",
    name: "PDF to PDF/A",
    category: "convert",
    title: "PDF to PDF/A Converter – Archive-Ready PDF/A-1b, 2b, 3b",
    description: "Convert PDF to PDF/A (1b, 2b or 3b) for long-term archiving, and optionally PDF/UA for accessibility.",
    intro: "Convert PDFs to the PDF/A archiving standard required by courts, governments and archives.",
    route: "pdfengines/convert",
    input: pdfInput(true),
    fields: [
      {
        name: "pdfa",
        label: "PDF/A level",
        type: "select",
        default: "PDF/A-2b",
        required: true,
        options: [
          { value: "PDF/A-1b", label: "PDF/A-1b" },
          { value: "PDF/A-2b", label: "PDF/A-2b (recommended)" },
          { value: "PDF/A-3b", label: "PDF/A-3b" },
        ],
      },
      { name: "pdfua", label: "Also make it PDF/UA (accessible)", type: "checkbox", default: false },
    ],
    output: "pdf-or-zip",
    steps: ["Upload your PDF.", "Choose the PDF/A level.", "Download the archive-ready file."],
    faq: [{ q: "Which PDF/A level should I pick?", a: "PDF/A-2b works for most needs. Use PDF/A-3b if you need to embed other files." }],
  },
  {
    slug: "flatten-pdf",
    name: "Flatten PDF",
    category: "edit",
    title: "Flatten PDF – Merge Form Fields and Annotations into the Page",
    description: "Flatten PDF forms and annotations so they can no longer be edited. Free online PDF flattener.",
    intro: "Lock filled-in forms and annotations into the page so nobody can change them.",
    route: "pdfengines/flatten",
    input: pdfInput(true),
    fields: [],
    output: "pdf-or-zip",
    steps: ["Upload your filled PDF.", "Click convert.", "Download the flattened PDF."],
    faq: [{ q: "Why flatten a PDF?", a: "Flattening makes form answers and comments part of the page, so they print correctly and can't be edited." }],
  },
  {
    slug: "edit-pdf-metadata",
    name: "Edit PDF metadata",
    category: "edit",
    title: "Edit PDF Metadata – Change Title, Author, Subject, Keywords",
    description: "Change the title, author, subject and keywords stored inside a PDF file. Free online metadata editor.",
    intro: "Change the title, author, subject and keywords stored inside your PDF, which search engines and readers display.",
    route: "pdfengines/metadata/write",
    input: pdfInput(true),
    fields: [
      { name: "metaTitle", label: "Title", type: "text", virtual: true },
      { name: "metaAuthor", label: "Author", type: "text", virtual: true },
      { name: "metaSubject", label: "Subject", type: "text", virtual: true },
      { name: "metaKeywords", label: "Keywords", type: "text", virtual: true, placeholder: "invoice, 2026" },
    ],
    output: "pdf-or-zip",
    steps: ["Upload your PDF.", "Fill in the fields you want to change.", "Download the updated PDF."],
    faq: [{ q: "Why does PDF metadata matter?", a: "Google shows the PDF title in search results, and readers show it in the window title." }],
  },
  {
    slug: "pdf-metadata-viewer",
    name: "View PDF metadata",
    category: "inspect",
    title: "PDF Metadata Viewer – See Hidden PDF Properties Online",
    description: "See all the hidden metadata in a PDF: author, creator app, dates, page count, PDF version and more.",
    intro: "See everything stored inside a PDF: author, the app that made it, creation dates, page count and more.",
    route: "pdfengines/metadata/read",
    input: pdfInput(true),
    fields: [],
    output: "json",
    steps: ["Upload your PDF.", "Read the metadata on screen."],
    faq: [{ q: "Can metadata reveal personal information?", a: "Yes. It may contain author names and software details. Use Edit PDF metadata to change them." }],
  },
  {
    slug: "add-bookmarks-to-pdf",
    name: "Add bookmarks to PDF",
    category: "edit",
    title: "Add Bookmarks to PDF – Create a PDF Table of Contents",
    description: "Add clickable bookmarks (outline) to a PDF so readers can jump to chapters. Free online tool.",
    intro: "Add a clickable outline to your PDF so readers can jump straight to each chapter.",
    route: "pdfengines/bookmarks/write",
    input: pdfInput(),
    fields: [
      {
        name: "bookmarks",
        label: "Bookmarks (JSON)",
        type: "textarea",
        required: true,
        default: '[\n  { "title": "Introduction", "page": 1, "children": [] },\n  { "title": "Chapter 1", "page": 2, "children": [] }\n]',
        help: "Each bookmark has a title, a page number and optional children",
      },
    ],
    output: "pdf",
    steps: ["Upload your PDF.", "List your chapters and page numbers.", "Download the PDF with bookmarks."],
    faq: [{ q: "Can bookmarks be nested?", a: "Yes. Put bookmarks inside another bookmark's children list." }],
  },
  {
    slug: "pdf-bookmarks-viewer",
    name: "View PDF bookmarks",
    category: "inspect",
    title: "Extract PDF Bookmarks – Export a PDF Outline as JSON",
    description: "Read the bookmarks (table of contents) of a PDF and export them as JSON.",
    intro: "Export the bookmark outline of a PDF as JSON, for example to copy it to another file.",
    route: "pdfengines/bookmarks/read",
    input: pdfInput(true),
    fields: [],
    output: "json",
    steps: ["Upload your PDF.", "Copy the bookmark list."],
    faq: [{ q: "My PDF shows an empty list.", a: "The PDF has no bookmarks. Use Add bookmarks to PDF to create some." }],
  },
  {
    slug: "embed-files-in-pdf",
    name: "Attach files to PDF",
    category: "edit",
    title: "Attach Files to PDF – Embed XML, Images or Any File in a PDF",
    description: "Embed attachments such as XML invoices, spreadsheets or images inside a PDF file. Free online tool.",
    intro: "Embed attachments inside a PDF, such as the XML of an e-invoice or the source spreadsheet.",
    route: "pdfengines/embed",
    input: pdfInput(),
    extraFiles: [{ name: "embeds", label: "Files to attach", accept: "*", multiple: true, required: true }],
    fields: [],
    output: "pdf",
    steps: ["Upload your PDF.", "Choose the files to attach.", "Download the PDF with attachments."],
    faq: [{ q: "How do I open the attachments?", a: "In Adobe Reader or most PDF viewers, open the Attachments (paperclip) panel." }],
  },
  {
    slug: "website-screenshot",
    name: "Website screenshot",
    category: "capture",
    title: "Website Screenshot Tool – Full-Page Screenshot of Any URL",
    description: "Take a full-page screenshot of any website as PNG, JPEG or WebP. Choose viewport size and retina quality.",
    intro: "Capture a full-page or viewport screenshot of any public website as PNG, JPEG or WebP.",
    route: "chromium/screenshot/url",
    input: { kind: "url" },
    fields: screenshotFields,
    output: "image",
    steps: ["Paste the website URL.", "Choose size and format.", "Download your screenshot."],
    faq: [
      { q: "Can I capture the whole page?", a: "Yes. By default the full scrolling page is captured. Tick “Only the visible viewport” for just the first screen." },
      { q: "How do I take a mobile screenshot?", a: "Set the width to 390 and the height to 844." },
    ],
  },
  {
    slug: "html-to-image",
    name: "HTML to image",
    category: "capture",
    title: "HTML to Image – Convert HTML & CSS to PNG, JPEG or WebP",
    description: "Render HTML and CSS to an image with a real Chrome browser. Great for social cards and previews.",
    intro: "Render HTML and CSS into a PNG, JPEG or WebP image. Great for social cards, banners and previews.",
    route: "chromium/screenshot/html",
    input: { kind: "html" },
    fields: screenshotFields,
    output: "image",
    steps: ["Paste your HTML.", "Choose size and format.", "Download your image."],
    faq: [{ q: "Can I make an Open Graph image?", a: "Yes. Set the width to 1200 and the height to 630 and tick “Only the visible viewport”." }],
  },
];

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}
