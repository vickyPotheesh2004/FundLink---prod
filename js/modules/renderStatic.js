export async function renderStatic(section, app, htmlPath) {
    try {
        const response = await fetch(htmlPath);
        if (!response.ok) throw new Error(`Failed to load ${htmlPath}: ${response.statusText}`);
        const html = await response.text();

        // Extract body content only if it's a full HTML file
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // Use main/body content, fallback to full text
        const content = doc.querySelector('body') ? doc.querySelector('body').innerHTML : html;

        section.innerHTML = content;

        // Re-attach scripts if any (simple approach)
        // Note: Inline scripts in fetched HTML won't run automatically. 
        // We rely on main.js to handle logic, or we'd need to eval them (risky).
        // For this refactor, we assume logic is migrating to main.js / specific page modules.

    } catch (error) {
        console.error(`Error loading ${htmlPath}:`, error);
        section.innerHTML = `<div class="p-8 text-center text-red-500">Error loading content: ${error.message}</div>`;
    }
}
