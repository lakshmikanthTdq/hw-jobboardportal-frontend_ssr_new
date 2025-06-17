export const applyTheme = (theme) => {
    if (!theme) return;

    const root = document.documentElement;

    // Apply background & font colors
    root.style.setProperty("--primary-bg-color", theme.primaryColor);
    root.style.setProperty("--secondary-bg-color", theme.secondaryColor);
    root.style.setProperty("--primary-background-text-color", theme.primaryFontColor);
    root.style.setProperty("--secondary-background-text-color", theme.secondaryFontColor);

    // Ensure fontFamily is always an array
    let fontFamilyArray = [];
    if (Array.isArray(theme.fontFamily)) {
        fontFamilyArray = theme.fontFamily; // Already an array
    } else if (typeof theme.fontFamily === "string") {
        fontFamilyArray = theme.fontFamily.replace(/"/g, "").split(",").map(f => f.trim()); // Convert string to array
    } else {
        fontFamilyArray = []; 
    }

    // Convert multiple font families to correct CSS format
    if (fontFamilyArray.length === 0) {
        root.style.removeProperty("--applications-font-family"); // Remove the CSS variable
    } else {
        // Convert multiple font families to correct CSS format
        const fontFamilyString = fontFamilyArray
            .map(font => (font.includes(" ") ? `"${font}"` : font))
            .join(", ");

        root.style.setProperty("--applications-font-family", fontFamilyString);
    }

    // Apply header styles **only when useCustomHeader is true**
    if (theme.useCustomHeader) {
        root.style.setProperty("--header-background-color", theme.headerBackgroundColor);
        root.style.setProperty("--header-text-color", theme.headerTextColor);
    } else {
        // Reset to default values
        root.style.removeProperty("--header-background-color");
        root.style.removeProperty("--header-text-color");
    }

    // Load font styles dynamically in `<head>`
    loadGoogleFonts(fontFamilyArray);
};



export const resetTheme = () => {
    const root = document.documentElement;
    root.style.setProperty("--primary-bg-color", "#FFD800");
    root.style.setProperty("--secondary-bg-color", "#3B4046");
    root.style.setProperty("--primary-background-text-color", "#3B4046");
    root.style.setProperty("--secondary-background-text-color", "#ffffff");
    root.style.setProperty("--applications-font-family", '"Roboto", sans-serif');

    // Remove header styles if they were applied
    root.style.removeProperty("--header-background-color");
    root.style.removeProperty("--header-text-color");

    // Reset Google Fonts (optional: remove dynamically added font links)
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach(link => link.parentNode.removeChild(link));
};


// Function to dynamically load Google Fonts
const loadGoogleFonts = (fontFamilies) => {
    fontFamilies.forEach(font => {
        const fontName = font.replace(/ /g, "+");
        const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName}:wght@100..900&display=swap`;

        // Check if font is already loaded
        if (!document.querySelector(`link[href="${fontUrl}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = fontUrl;
            document.head.appendChild(link);
        }
    });
};