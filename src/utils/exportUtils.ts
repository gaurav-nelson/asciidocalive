export async function exportToPDF() {
  try {
    // Get the HTML content from the preview div
    const previewElement = document.getElementById('editor-content');
    if (!previewElement) throw new Error('Preview element not found');

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) throw new Error('Failed to open print window');

    const modernStyles = `
      body {
        max-width: 48rem !important;
        margin: 0 auto !important;
        padding: 2rem !important;
      }
    `;

    // Get the asciidoctor styles
    const styles = await fetch('https://raw.githubusercontent.com/asciidoctor/asciidoctor/main/src/stylesheets/asciidoctor.css')
      .then(response => response.text());

    // Set up the print window content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>${styles}</style>
          <style>${modernStyles}</style>
        </head>
        <body>
          <div class="content">
            ${previewElement.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        resolve();
      }, 250);
    });
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export to PDF');
  }
}

export function exportToAsciiDoc(getEditorContent: () => string) {
  try {
    const content = getEditorContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.adoc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export AsciiDoc');
  }
}

export async function exportToHTML(getEditorContent: () => string) {
  try {
    const previewElement = document.getElementById('editor-content');
    if (!previewElement) throw new Error('Preview element not found');

    const modernStyles = `
      body {
        max-width: 48rem !important;
        margin: 0 auto !important;
        padding: 2rem !important;
      }
    `;

    // Get the asciidoctor styles
    const styles = await fetch('https://raw.githubusercontent.com/asciidoctor/asciidoctor/main/src/stylesheets/asciidoctor.css')
      .then(response => response.text());

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>${styles}</style>
          <style>${modernStyles}</style>
        </head>
        <body>
          ${previewElement.innerHTML}
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export HTML');
  }
}
