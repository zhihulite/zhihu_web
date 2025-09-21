// www/js/components/theme.js

export function ThemeComponent() {
  return {
    // --- State ---
    currentTheme: localStorage.getItem("theme") || "auto",
    currentStyle: localStorage.getItem("f7style") || "md",

    // --- Methods ---
    initTheme() {
      this.applyTheme(this.currentTheme);

      // Listen for system theme changes
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          if (this.currentTheme === "auto") {
            this.setTheme("auto"); // Re-apply 'auto' to detect system change
          }
        });
    },

    setTheme(theme) {
      this.currentTheme = theme;
      localStorage.setItem("theme", theme);
      this.applyTheme(theme);
    },

    setStyle(style) {
      this.currentStyle = style;
      localStorage.setItem("f7style", style);
      // Reload the app to apply the new Framework7 style
      window.location.reload();
    },

    applyTheme(theme) {
      const appEl = document.querySelector(".framework7-root");
      if (!appEl) return;

      let themeToApply = theme;
      if (theme === "auto") {
        themeToApply = this.getSystemTheme();
      }

      if (themeToApply === "dark") {
        appEl.classList.add("dark");
        setStatusBar("DARK");
      } else {
        appEl.classList.remove("dark");
        setStatusBar("LIGHT");
      }
    },

    getSystemTheme() {
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    },
  };
}

// Expose component to global scope for petite-vue and general access
window.ThemeComponent = ThemeComponent;

// Initialize the theme as soon as the script loads
window.themeManager = ThemeComponent();
window.themeManager.initTheme();
