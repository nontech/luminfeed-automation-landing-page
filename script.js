// ===================================================================
// GOOGLE FORMS CONFIGURATION
// ===================================================================
const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSeVvTi-s9ZrkjIkhC0684Xs38MekLpAGeVXEPxwVo5vuh47Cw/formResponse";

const GOOGLE_FORM_FIELDS = {
  email: "entry.1665392", // Email field
  userType: "entry.1358532560", // Customer Type field
  createdOn: "entry.1188257748", // Created On field
};

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Date formatting function for Google Forms
function formatDateForForm(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  return `${dayName}, ${day} ${monthName}, ${year} ${hours}:${minutes} ${ampm}`;
}

/**
 * Submits waitlist data to Google Forms
 * @param {string} email - The email address (required)
 * @param {string} customer_type - The customer type (required)
 * @returns {Promise<Object>} - Returns success status
 */
async function insertWaitlistRow(email, customer_type) {
  try {
    // Validate inputs
    if (!email || typeof email !== "string") {
      throw new Error("Email is required and must be a string");
    }

    if (!customer_type || typeof customer_type !== "string") {
      throw new Error(
        "Customer type is required and must be a string"
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      throw new Error("Invalid email format");
    }

    // Prepare form data
    const formData = new FormData();
    formData.append(
      GOOGLE_FORM_FIELDS.email,
      email.trim().toLowerCase()
    );
    formData.append(
      GOOGLE_FORM_FIELDS.userType,
      customer_type.trim()
    );

    // Add current timestamp to Created On field with custom format
    const now = new Date();
    const formattedDate = formatDateForForm(now);
    console.log(
      "Sending formatted date to Google Forms:",
      formattedDate
    );
    formData.append(GOOGLE_FORM_FIELDS.createdOn, formattedDate);

    // Submit to Google Forms
    await fetch(GOOGLE_FORM_ACTION, {
      method: "POST",
      mode: "no-cors", // Google Forms requires no-cors mode
      body: formData,
    });

    // Note: With no-cors, we can't read the response, so we assume success
    console.log("Successfully submitted to Google Forms");
    return {
      success: true,
      data: {
        id: Date.now(),
        email: email.trim().toLowerCase(),
        customer_type: customer_type.trim(),
        timestamp: formattedDate,
      },
    };
  } catch (error) {
    console.error("Error submitting to Google Forms:", error.message);
    return { success: false, error: error.message };
  }
}

// ===================================================================
// MAIN APPLICATION CLASS
// ===================================================================

// Application state management
class LuminFeedApp {
  constructor() {
    this.state = {
      isMobileMenuOpen: false,
      isWaitlistModalOpen: false,
      isSuccessModalOpen: false,
    };

    this.elements = {};
    this.observers = [];

    this.init();
  }

  // Initialize the application
  init() {
    this.cacheElements();
    this.bindEvents();
    this.initializeFeatures();
    console.log("🚀 LuminFeed Automation Landing Page Loaded!");
  }

  // Cache all DOM elements in one place
  cacheElements() {
    const selectors = {
      // Navigation
      header: "header",
      mobileMenuBtn: "#mobileMenuBtn",
      mobileMenu: "#mobileMenu",

      // Buttons
      getStartedBtn: "#getStartedBtn",
      tryLuminFeedBtn: "#tryLuminFeedBtn",
      watchDemoBtn: "#watchDemoBtn",

      // Forms
      contactForm: "#contactForm",
      waitlistForm: "#waitlistForm",
      waitlistEmail: "#waitlistEmail",
      userTypeSelect: "#userType",

      // Modals
      waitlistModal: "#waitlistModal",
      successModal: "#successModal",
      closeWaitlistModal: "#closeWaitlistModal",
      closeSuccessModal: "#closeSuccessModal",

      // Other elements
      workflowInput: "#workflowInput",
      waitlistCount: "#waitlistCount",
      hero: ".hero",
      logo: "header h1",
    };

    // Cache all elements
    Object.entries(selectors).forEach(([key, selector]) => {
      this.elements[key] = document.querySelector(selector);
    });

    // Cache collections
    this.elements.statNumbers =
      document.querySelectorAll(".stat-number");
    this.elements.exampleButtons =
      document.querySelectorAll(".example-button");
    this.elements.navLinks =
      document.querySelectorAll('a[href^="#"]');
  }

  // Use event delegation for better performance
  bindEvents() {
    // Document-level event delegation
    document.addEventListener(
      "click",
      this.handleDocumentClick.bind(this)
    );
    document.addEventListener(
      "submit",
      this.handleFormSubmit.bind(this)
    );
    document.addEventListener(
      "keydown",
      this.handleKeydown.bind(this)
    );

    // Window events with throttling
    window.addEventListener(
      "scroll",
      this.throttle(this.handleScroll.bind(this), 16)
    );
    window.addEventListener("load", this.handleLoad.bind(this));

    // Mobile menu icon SVG update
    this.updateMobileMenuIcon(false);
  }

  // Centralized click handler using event delegation
  handleDocumentClick(e) {
    // Try multiple ways to find the target element
    let target = e.target.closest(
      '[data-action], #mobileMenuBtn, .example-button, a[href^="#"]'
    );

    // If no target found, check if we clicked directly on a button with data-action
    if (
      !target &&
      e.target.hasAttribute &&
      e.target.hasAttribute("data-action")
    ) {
      target = e.target;
    }

    // Also check for specific button IDs
    if (!target) {
      target = e.target.closest(
        "#getStartedBtn, #tryLuminFeedBtn, #watchDemoBtn"
      );
    }

    if (!target) return;

    // Handle navigation links
    if (target.matches('a[href^="#"]')) {
      e.preventDefault();
      this.handleSmoothScroll(target);
      return;
    }

    // Handle mobile menu
    if (target.id === "mobileMenuBtn") {
      this.toggleMobileMenu();
      return;
    }

    // Handle example buttons
    if (target.matches(".example-button")) {
      this.handleExampleClick(target);
      return;
    }

    // Handle data-action buttons or specific button IDs
    const action = target.dataset.action;
    const buttonId = target.id;

    // Handle by data-action first
    if (action) {
      switch (action) {
        case "open-waitlist":
          this.openWaitlistModal();
          break;
        case "close-waitlist":
          this.closeWaitlistModal();
          break;
        case "close-success":
          this.closeSuccessModal();
          break;
        case "watch-demo":
          this.handleWatchDemo();
          break;
        default:
          // Handle modal backdrop clicks
          if (target === this.elements.waitlistModal) {
            this.closeWaitlistModal();
          } else if (target === this.elements.successModal) {
            this.closeSuccessModal();
          }
      }
    }
    // Handle by button ID as fallback
    else if (
      buttonId === "getStartedBtn" ||
      buttonId === "tryLuminFeedBtn"
    ) {
      this.openWaitlistModal();
    } else if (buttonId === "watchDemoBtn") {
      this.handleWatchDemo();
    }

    // Add button feedback
    if (target.matches("button")) {
      this.addButtonFeedback(target);
    }
  }

  // Centralized form handler
  async handleFormSubmit(e) {
    if (e.target.id === "contactForm") {
      e.preventDefault();
      await this.handleContactSubmit(e.target);
    } else if (e.target.id === "waitlistForm") {
      e.preventDefault();
      await this.handleWaitlistSubmit(e.target);
    }
  }

  // Handle keyboard events
  handleKeydown(e) {
    if (e.key === "Escape") {
      if (this.state.isWaitlistModalOpen) {
        this.closeWaitlistModal();
      } else if (this.state.isSuccessModalOpen) {
        this.closeSuccessModal();
      }
    }
  }

  // Throttled scroll handler
  handleScroll() {
    this.updateNavbarShadow();
    this.updateParallax();
  }

  // Handle page load
  handleLoad() {
    document.body.classList.remove("opacity-0");
    document.body.classList.add("opacity-100");
  }

  // Navigation and UI methods
  handleSmoothScroll(anchor) {
    const target = document.querySelector(
      anchor.getAttribute("href")
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      // Close mobile menu if open
      if (this.state.isMobileMenuOpen) {
        this.toggleMobileMenu();
      }
    }
  }

  toggleMobileMenu() {
    this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen;
    this.elements.mobileMenu?.classList.toggle(
      "hidden",
      !this.state.isMobileMenuOpen
    );
    this.updateMobileMenuIcon(this.state.isMobileMenuOpen);
  }

  updateMobileMenuIcon(isOpen) {
    const icon = this.elements.mobileMenuBtn?.querySelector("svg");
    if (!icon) return;

    icon.innerHTML = isOpen
      ? '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      : '<path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
  }

  handleExampleClick(button) {
    const exampleText = button.dataset.example;
    if (this.elements.workflowInput && exampleText) {
      this.elements.workflowInput.value = exampleText;
      this.elements.workflowInput.focus();
    }
  }

  handleWatchDemo() {
    const featuresSection = document.getElementById("features");
    featuresSection?.scrollIntoView({ behavior: "smooth" });
  }

  addButtonFeedback(button) {
    button.style.transform = "scale(0.95)";
    setTimeout(() => {
      button.style.transform = "scale(1)";
    }, 150);
  }

  // Modal management
  openWaitlistModal() {
    if (!this.elements.waitlistModal) {
      console.error("❌ Waitlist modal element not found!");
      return;
    }

    this.state.isWaitlistModalOpen = true;
    this.elements.waitlistModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Focus email input and animate count
    setTimeout(() => {
      this.elements.waitlistEmail?.focus();
      this.animateWaitlistCount();
    }, 300);
  }

  closeWaitlistModal() {
    this.state.isWaitlistModalOpen = false;
    this.elements.waitlistModal?.classList.add("hidden");
    document.body.style.overflow = "auto";
    this.elements.waitlistForm?.reset();
    this.clearErrors();
  }

  openSuccessModal() {
    this.state.isSuccessModalOpen = true;
    this.closeWaitlistModal();
    this.elements.successModal?.classList.remove("hidden");
  }

  closeSuccessModal() {
    this.state.isSuccessModalOpen = false;
    this.elements.successModal?.classList.add("hidden");
    document.body.style.overflow = "auto";
  }

  animateWaitlistCount() {
    if (!this.elements.waitlistCount) return;

    const targetCount = 1247 + Math.floor(Math.random() * 50);
    let currentCount = 1200;
    const increment = (targetCount - currentCount) / 20;

    const animate = () => {
      currentCount += increment;
      if (currentCount >= targetCount) {
        this.elements.waitlistCount.textContent =
          targetCount.toLocaleString();
      } else {
        this.elements.waitlistCount.textContent =
          Math.floor(currentCount).toLocaleString();
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  // Form handling
  async handleContactSubmit(form) {
    const formData = new FormData(form);
    const { name, email, message } = Object.fromEntries(formData);

    // Validation
    if (!name || !email || !message) {
      this.showMessage("Please fill in all fields.", "error");
      return;
    }

    if (!isValidEmail(email)) {
      this.showMessage(
        "Please enter a valid email address.",
        "error"
      );
      return;
    }

    // Simulate submission
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    this.setButtonLoading(submitButton, "Sending...");

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      form.reset();
      this.showMessage(
        "Thank you for your message! We'll get back to you soon.",
        "success"
      );
    } finally {
      this.resetButton(submitButton, originalText);
    }
  }

  async handleWaitlistSubmit(form) {
    const email = this.elements.waitlistEmail.value.trim();
    const userType = this.elements.userTypeSelect.value;
    const submitBtn = document.getElementById("joinWaitlistBtn");

    // Validation
    if (!email || !isValidEmail(email)) {
      this.showWaitlistError("Please enter a valid email address.");
      return;
    }

    if (!userType) {
      this.showWaitlistError("Please select your user type.");
      return;
    }

    // Submit to waitlist
    const originalText = submitBtn.textContent;
    this.setButtonLoading(submitBtn, "Securing Your Spot...");

    try {
      const result = await insertWaitlistRow(email, userType);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Save to localStorage as backup
      this.saveToLocalStorage(
        email,
        userType,
        result.data?.id || Date.now()
      );

      setTimeout(() => {
        this.openSuccessModal();
        this.resetButton(submitBtn, originalText);
      }, 1500);
    } catch (error) {
      console.error("Waitlist submission error:", error);

      // Handle submission errors gracefully
      this.showWaitlistError(
        "Something went wrong. Please try again or contact support."
      );

      this.resetButton(submitBtn, originalText);
    }
  }

  // Helper methods for forms
  setButtonLoading(button, text) {
    button.textContent = text;
    button.disabled = true;
  }

  resetButton(button, originalText) {
    button.textContent = originalText;
    button.disabled = false;
  }

  saveToLocalStorage(email, userType, id) {
    const waitlistEmails = JSON.parse(
      localStorage.getItem("waitlistEmails") || "[]"
    );
    waitlistEmails.push({
      email,
      userType,
      timestamp: formatDateForForm(new Date()),
      id,
    });
    localStorage.setItem(
      "waitlistEmails",
      JSON.stringify(waitlistEmails)
    );
  }

  // Message display
  showMessage(message, type) {
    if (!this.elements.contactForm) return;

    this.clearMessages();

    const messageDiv = document.createElement("div");
    messageDiv.className = `${type}-message ${
      type === "success"
        ? "bg-green-100 text-green-800 border-green-200"
        : "bg-red-100 text-red-800 border-red-200"
    } p-4 rounded-lg mt-4 border`;
    messageDiv.textContent = message;

    this.elements.contactForm.appendChild(messageDiv);

    // Auto-hide
    setTimeout(() => {
      messageDiv.classList.add(
        "opacity-0",
        "transition-opacity",
        "duration-300"
      );
      setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
  }

  showWaitlistError(message) {
    this.clearErrors();

    const errorDiv = document.createElement("div");
    errorDiv.className =
      "error-message bg-red-100 text-red-700 p-3 rounded-lg mt-2 text-sm";
    errorDiv.textContent = message;

    this.elements.waitlistForm?.appendChild(errorDiv);

    setTimeout(() => errorDiv.remove(), 5000);
  }

  clearMessages() {
    document
      .querySelectorAll(".success-message, .error-message")
      .forEach((msg) => msg.remove());
  }

  clearErrors() {
    this.elements.waitlistForm
      ?.querySelectorAll(".error-message")
      .forEach((error) => error.remove());
  }

  // Animation and effects
  initializeFeatures() {
    this.initializeIntersectionObserver();
    this.initializeFadeInAnimation();
    this.initializeEasterEgg();

    // Add initial loading animation class
    document.body.classList.add(
      "opacity-0",
      "transition-opacity",
      "duration-500"
    );
  }

  initializeIntersectionObserver() {
    // Stats animation observer
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateStatNumber(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    });

    this.elements.statNumbers.forEach((stat) =>
      statsObserver.observe(stat)
    );
    this.observers.push(statsObserver);
  }

  animateStatNumber(statElement) {
    const target = parseInt(statElement.dataset.target);
    if (!target) return;

    let current = 0;
    const increment = target / 120; // 2 seconds at 60fps

    const animate = () => {
      current += increment;
      if (current >= target) {
        statElement.textContent = target.toLocaleString();
      } else {
        statElement.textContent =
          Math.floor(current).toLocaleString();
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  initializeFadeInAnimation() {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("opacity-0", "translate-y-8");
          entry.target.classList.add("opacity-100", "translate-y-0");
        }
      });
    });

    // Add fade-in to feature cards and stats
    document
      .querySelectorAll(".feature-card, .stat")
      .forEach((el) => {
        el.classList.add(
          "opacity-0",
          "translate-y-8",
          "transition-all",
          "duration-700"
        );
        fadeObserver.observe(el);
      });

    this.observers.push(fadeObserver);
  }

  initializeEasterEgg() {
    if (!this.elements.logo) return;

    let clickCount = 0;
    this.elements.logo.addEventListener("click", () => {
      clickCount++;
      if (clickCount === 5) {
        this.elements.logo.classList.add("animate-pulse");
        setTimeout(() => {
          this.elements.logo.classList.remove("animate-pulse");
        }, 1000);
        console.log(
          "🎉 You found the easter egg! Thanks for clicking!"
        );
        clickCount = 0;
      }
    });
  }

  // Scroll effects
  updateNavbarShadow() {
    if (!this.elements.header) return;

    if (window.scrollY > 50) {
      this.elements.header.classList.add("shadow-md");
      this.elements.header.classList.remove("shadow-sm");
    } else {
      this.elements.header.classList.remove("shadow-md");
      this.elements.header.classList.add("shadow-sm");
    }
  }

  updateParallax() {
    if (!this.elements.hero) return;

    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.2;

    if (scrolled <= this.elements.hero.offsetHeight) {
      this.elements.hero.style.transform = `translateY(${rate}px)`;
    }
  }

  // Utility method for throttling
  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Cleanup method
  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.luminFeedApp = new LuminFeedApp();
});
