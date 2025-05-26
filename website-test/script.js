// Get the textarea elements and iframe for preview
const htmlCode = document.getElementById('htmlCode');
const cssCode = document.getElementById('cssCode');
const jsCode = document.getElementById('jsCode');
const iframe = document.getElementById('iframe');
const preview = document.getElementById('preview');

// Function to update the preview iframe with code
function updatePreview() {
  const htmlContent = htmlCode.value;
  const cssContent = `<style>${cssCode.value}</style>`;
  const jsContent = `<script>${jsCode.value}</script>`;

  // Combine all code and inject into iframe
  const code = htmlContent + cssContent + jsContent;

  // Check if any code has been entered
  if (htmlContent || cssCode.value || jsCode.value) {
    preview.classList.add('white-bg');  // Set the background to white
  } else {
    preview.classList.remove('white-bg');  // Default to dark background
  }

  // Write the combined code to the iframe document
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(code);
  doc.close();

  // Apply syntax highlighting using Prism.js
  Prism.highlightAll();
}

// Add event listeners for live code updating
htmlCode.addEventListener('input', updatePreview);
cssCode.addEventListener('input', updatePreview);
jsCode.addEventListener('input', updatePreview);

// Initialize the preview when the page loads
updatePreview();
