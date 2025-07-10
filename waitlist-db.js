// Supabase configuration - Update these with your project details
const supabaseUrl = "https://xbmrszxtnwaictzenhez.supabase.co"; // Updated to match the error URL
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibXJzenh0bndhaWN0emVuaGV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNzUzOTYsImV4cCI6MjA2Nzc1MTM5Nn0.2OCxWyJk84YGDR24vTWE3UMqrVIi64U2gfT-TJd7hXA"; // ❌ Current key is for different project (lvkyltptbtslkycufbsi)

// Create supabase client using the global supabase object
let supabase = null;

// Initialize Supabase client with error handling
function initializeSupabase() {
  try {
    if (!window.supabase) {
      throw new Error("Supabase library not loaded");
    }
    if (supabaseKey === "YOUR_SUPABASE_ANON_KEY") {
      throw new Error("Please configure your Supabase API key");
    }
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    return true;
  } catch (error) {
    console.error("Failed to initialize Supabase:", error);
    return false;
  }
}

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Inserts a new row into the waitlist database
 * @param {string} email - The email address (required, must be unique)
 * @param {string} customer_type - The customer type (required)
 * @returns {Promise<Object>} - Returns the inserted row data or error
 */
async function insertWaitlistRow(email, customer_type) {
  try {
    // Initialize Supabase if not already done
    if (!supabase && !initializeSupabase()) {
      throw new Error(
        "Database connection not available. Please check configuration."
      );
    }

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

    // Prepare the data to insert
    const insertData = {
      email: email.trim().toLowerCase(),
      customer_type: customer_type.trim(),
    };

    // Insert the new row
    const { data, error } = await supabase
      .from("waitlist")
      .insert([insertData])
      .select();

    if (error) {
      // Handle unique constraint violation for email
      if (
        error.code === "23505" &&
        error.message.includes("waitlist_email_key")
      ) {
        throw new Error("Email address already exists in waitlist");
      }
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("Failed to insert row");
    }

    console.log("Successfully inserted waitlist row:", data[0]);
    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Error inserting waitlist row:", error.message);
    return { success: false, error: error.message };
  }
}

export { insertWaitlistRow, isValidEmail };
