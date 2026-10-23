(() => {
  const root = document.querySelector(".secure-qr-page");
  if (!root) return;

  const modes = {
    auto: {
      label: "AUTO GENERATION",
      title: "Generate codes inside the software.",
      description: "Create the variable code set for the print run directly in the Secure QR Printing software.",
      source: "Software",
    },
    api: {
      label: "API ENDPOINT",
      title: "Fetch codes from your system.",
      description: "Connect the print workflow to an API endpoint and retrieve the code data prepared by your system.",
      source: "API endpoint",
    },
    csv: {
      label: "CSV IMPORT",
      title: "Bring a prepared code file.",
      description: "Import code data from a CSV file, then apply the saved print configuration before production begins.",
      source: "CSV file",
    },
  };

  const buttons = [...root.querySelectorAll("[data-qr-source]")];
  const preview = root.querySelector("[data-qr-preview]");
  if (!buttons.length || !preview) return;

  const label = preview.querySelector("[data-qr-preview-label]");
  const title = preview.querySelector("[data-qr-preview-title]");
  const description = preview.querySelector("[data-qr-preview-description]");
  const source = preview.querySelector("[data-qr-preview-source]");

  const selectMode = (mode) => {
    const content = modes[mode];
    if (!content) return;
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.qrSource === mode)));
    if (label) label.textContent = content.label;
    if (title) title.textContent = content.title;
    if (description) description.textContent = content.description;
    if (source) source.textContent = content.source;
  };

  buttons.forEach((button) => button.addEventListener("click", () => selectMode(button.dataset.qrSource)));
})();
