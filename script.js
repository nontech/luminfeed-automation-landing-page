// DOM Elements
const getStartedBtn = document.getElementById("getStartedBtn");
const watchDemoBtn = document.getElementById("watchDemoBtn");
const contactForm = document.getElementById("contactForm");
const statNumbers = document.querySelectorAll(".stat-number");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Close mobile menu if open
      if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.add("hidden");
        updateMobileMenuIcon(false);
      }
    }
  });
});

// Mobile menu toggle
let isMobileMenuOpen = false;

function updateMobileMenuIcon(isOpen) {
  const icon = mobileMenuBtn.querySelector("svg");
  if (isOpen) {
    icon.innerHTML =
      '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
  } else {
    icon.innerHTML =
      '<path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
  }
}

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener("click", function () {
    isMobileMenuOpen = !isMobileMenuOpen;

    if (isMobileMenuOpen) {
      mobileMenu.classList.remove("hidden");
    } else {
      mobileMenu.classList.add("hidden");
    }

    updateMobileMenuIcon(isMobileMenuOpen);
  });
}

// Button click handlers
getStartedBtn.addEventListener("click", function () {
  // Scroll to contact form
  document.getElementById("contact").scrollIntoView({
    behavior: "smooth",
  });

  // Add a visual feedback
  this.style.transform = "scale(0.95)";
  setTimeout(() => {
    this.style.transform = "scale(1)";
  }, 150);
});

if (watchDemoBtn) {
  watchDemoBtn.addEventListener("click", function () {
    // For now, scroll to features section - can be updated to show actual demo
    document.getElementById("features").scrollIntoView({
      behavior: "smooth",
    });

    // Add a visual feedback
    this.style.transform = "scale(0.95)";
    setTimeout(() => {
      this.style.transform = "scale(1)";
    }, 150);

    // Could also open a modal or redirect to demo video
    console.log(
      "Demo requested - this could open a video modal or redirect to demo page"
    );
  });
}

// Animated counter for statistics
function animateStats() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const statNumber = entry.target;
        const target = parseInt(
          statNumber.getAttribute("data-target")
        );
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60 FPS

        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            statNumber.textContent = target.toLocaleString();
            clearInterval(timer);
          } else {
            statNumber.textContent =
              Math.floor(current).toLocaleString();
          }
        }, 16);

        // Unobserve after animation starts
        observer.unobserve(statNumber);
      }
    });
  });

  statNumbers.forEach((stat) => {
    observer.observe(stat);
  });
}

// Fade in animation on scroll using Tailwind classes
function fadeInOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove("opacity-0", "translate-y-8");
        entry.target.classList.add("opacity-100", "translate-y-0");
      }
    });
  });

  // Add fade-in classes to elements that should animate
  const animatedElements = document.querySelectorAll(
    ".feature-card, .stat"
  );
  animatedElements.forEach((el) => {
    el.classList.add(
      "opacity-0",
      "translate-y-8",
      "transition-all",
      "duration-700"
    );
    observer.observe(el);
  });
}

// Contact form handling
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    // Simple validation
    if (!name || !email || !message) {
      showMessage("Please fill in all fields.", "error");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("Please enter a valid email address.", "error");
      return;
    }

    // Simulate form submission
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    submitButton.textContent = "Sending...";
    submitButton.disabled = true;

    // Simulate API call delay
    setTimeout(() => {
      // Reset form
      this.reset();

      // Show success message
      showMessage(
        "Thank you for your message! We'll get back to you soon.",
        "success"
      );

      // Reset button
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }, 1500);
  });
}

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Show success/error messages using Tailwind classes
function showMessage(message, type) {
  if (!contactForm) return;

  // Remove existing messages
  const existingMessages = document.querySelectorAll(
    ".success-message, .error-message"
  );
  existingMessages.forEach((msg) => msg.remove());

  // Create new message element
  const messageDiv = document.createElement("div");
  if (type === "success") {
    messageDiv.className =
      "success-message bg-green-100 text-green-800 p-4 rounded-lg mt-4 border border-green-200";
  } else {
    messageDiv.className =
      "error-message bg-red-100 text-red-800 p-4 rounded-lg mt-4 border border-red-200";
  }
  messageDiv.textContent = message;

  // Add message after the form
  contactForm.appendChild(messageDiv);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    messageDiv.classList.add(
      "opacity-0",
      "transition-opacity",
      "duration-300"
    );
    setTimeout(() => {
      messageDiv.remove();
    }, 300);
  }, 5000);
}

// Navbar scroll effect - updated for new white navbar
function handleNavbarScroll() {
  const header = document.querySelector("header");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("shadow-md");
      header.classList.remove("shadow-sm");
    } else {
      header.classList.remove("shadow-md");
      header.classList.add("shadow-sm");
    }
  });
}

// Parallax effect for hero section
function parallaxEffect() {
  const hero = document.querySelector(".hero");

  if (hero) {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.2; // Gentler parallax for the new hero

      if (scrolled <= hero.offsetHeight) {
        hero.style.transform = `translateY(${rate}px)`;
      }
    });
  }
}

// Add loading animation
function addLoadingAnimation() {
  const body = document.body;
  body.classList.add(
    "opacity-0",
    "transition-opacity",
    "duration-500"
  );

  window.addEventListener("load", () => {
    body.classList.remove("opacity-0");
    body.classList.add("opacity-100");
  });
}

// Initialize all features when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all interactive features
  animateStats();
  fadeInOnScroll();
  handleNavbarScroll();
  parallaxEffect();
  addLoadingAnimation();

  // Add some dynamic content
  console.log("🚀 LuminFeed Automation Landing Page Loaded!");
  console.log("Ready to automate your content pipeline!");
});

// Add some easter eggs
let clickCount = 0;
const logoElement = document.querySelector("header h1");
if (logoElement) {
  logoElement.addEventListener("click", function () {
    clickCount++;
    if (clickCount === 5) {
      this.classList.add("animate-pulse");
      setTimeout(() => {
        this.classList.remove("animate-pulse");
      }, 1000);
      console.log(
        "🎉 You found the easter egg! Thanks for clicking!"
      );
      clickCount = 0;
    }
  });
}
