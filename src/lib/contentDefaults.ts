/**
 * Content Defaults — Single Source of Truth
 *
 * Every CMS-editable string lives here, organized by section.
 * Used by:
 *   - Runtime (fallback when DB value is missing)
 *   - Seed script (auto-generates SiteContent rows)
 *   - Admin CMS (shows default value for "reset to default")
 */

// ─── Section type ────────────────────────────────────────
export interface ContentItem {
  id: string;
  section: string;
  type: "text" | "image" | "markdown";
  value: string;
  label: string;
}

// ─── Homepage ────────────────────────────────────────────
export const homepageDefaults: ContentItem[] = [
  // Hero
  { id: "hero_title", section: "homepage", type: "text", value: "Don't throw it away. Fix it.", label: "Hero Title" },
  { id: "hero_subtitle", section: "homepage", type: "text", value: "Find local repair people for bikes, phones, appliances and more.", label: "Hero Subtitle" },
  { id: "hero_image", section: "homepage", type: "image", value: "/images/hero.jpg", label: "Hero Image" },
  { id: "hero_cta_primary", section: "homepage", type: "text", value: "Post a Repair Request", label: "Hero Primary Button" },
  { id: "hero_cta_secondary", section: "homepage", type: "text", value: "Become a Fixer", label: "Hero Secondary Button" },
  { id: "hero_trust_free", section: "homepage", type: "text", value: "Free to post", label: "Hero Trust - Free to Post" },
  { id: "hero_trust_pay", section: "homepage", type: "text", value: "Pay only when fixed", label: "Hero Trust - Pay When Fixed" },
  { id: "hero_trust_verified", section: "homepage", type: "text", value: "Trusted fixers", label: "Hero Trust - Verified" },

  // Stats
  { id: "stats_repairs", section: "homepage", type: "text", value: "1,000+", label: "Stats - Repairs Number" },
  { id: "stats_fixers", section: "homepage", type: "text", value: "200+", label: "Stats - Fixers Number" },
  { id: "stats_cities", section: "homepage", type: "text", value: "Amsterdam", label: "Stats - Cities" },
  { id: "stats_rating", section: "homepage", type: "text", value: "4.8 ⭐", label: "Stats - Rating" },
  { id: "stats_repairs_label", section: "homepage", type: "text", value: "Repairs Completed", label: "Stats - Repairs Label" },
  { id: "stats_fixers_label", section: "homepage", type: "text", value: "Trusted Fixers", label: "Stats - Fixers Label" },
  { id: "stats_cities_label", section: "homepage", type: "text", value: "Cities Served", label: "Stats - Cities Label" },
  { id: "stats_rating_label", section: "homepage", type: "text", value: "Average rating", label: "Stats - Rating Label" },

  // How It Works (homepage preview — 3 steps)
  { id: "how_it_works_title", section: "homepage", type: "text", value: "How FixMe Works", label: "How It Works Title" },
  { id: "how_it_works_step1_title", section: "homepage", type: "text", value: "1. Post Your Repair", label: "How It Works Step 1 Title" },
  { id: "how_it_works_step1_desc", section: "homepage", type: "text", value: "Describe what needs fixing. Add photos and location.", label: "How It Works Step 1 Description" },
  { id: "how_it_works_step2_title", section: "homepage", type: "text", value: "2. Get Offers", label: "How It Works Step 2 Title" },
  { id: "how_it_works_step2_desc", section: "homepage", type: "text", value: "Local fixers send you quotes and estimated times.", label: "How It Works Step 2 Description" },
  { id: "how_it_works_step3_title", section: "homepage", type: "text", value: "3. Choose & Pay", label: "How It Works Step 3 Title" },
  { id: "how_it_works_step3_desc", section: "homepage", type: "text", value: "Pick the best offer. Payment held securely until done.", label: "How It Works Step 3 Description" },
  { id: "how_it_works_step4_title", section: "homepage", type: "text", value: "4. Get It Fixed", label: "How It Works Step 4 Title" },
  { id: "how_it_works_step4_desc", section: "homepage", type: "text", value: "Your fixer completes the job. Leave a review when done.", label: "How It Works Step 4 Description" },

  // Categories
  { id: "categories_title", section: "homepage", type: "text", value: "What Can Be Fixed?", label: "Categories Section Title" },
  { id: "categories_subtitle", section: "homepage", type: "text", value: "From electronics to furniture, we fix it all.", label: "Categories Section Subtitle" },

  // Recent Requests
  { id: "homepage_recent_title", section: "homepage", type: "text", value: "Recent repair requests", label: "Recent Requests Title" },
  { id: "homepage_recent_view_all", section: "homepage", type: "text", value: "View all →", label: "Recent Requests View All Link" },
  { id: "homepage_recent_empty", section: "homepage", type: "text", value: "No repair requests yet.", label: "Recent Requests Empty State" },
  { id: "homepage_recent_empty_cta", section: "homepage", type: "text", value: "Post the first request", label: "Recent Requests Empty CTA" },

  // Trust Section
  { id: "trust_title", section: "homepage", type: "text", value: "Why Choose FixMe?", label: "Trust Section Title" },
  { id: "trust_badge1_title", section: "homepage", type: "text", value: "Verified Fixers", label: "Trust Badge 1 Title" },
  { id: "trust_badge1_desc", section: "homepage", type: "text", value: "All fixers verified with KVK registration", label: "Trust Badge 1 Description" },
  { id: "trust_badge2_title", section: "homepage", type: "text", value: "Secure Payment", label: "Trust Badge 2 Title" },
  { id: "trust_badge2_desc", section: "homepage", type: "text", value: "Money held safely until job is complete", label: "Trust Badge 2 Description" },
  { id: "trust_badge3_title", section: "homepage", type: "text", value: "Customer Support", label: "Trust Badge 3 Title" },
  { id: "trust_badge3_desc", section: "homepage", type: "text", value: "We're here to help every step of the way", label: "Trust Badge 3 Description" },

  // Fixer CTA
  { id: "homepage_fixer_cta_title", section: "homepage", type: "text", value: "Are you handy? Start earning with FixMe.", label: "Fixer CTA Title" },
  { id: "homepage_fixer_cta_desc", section: "homepage", type: "text", value: "Join hundreds of local repair people. Set your own hours, pick your own jobs.", label: "Fixer CTA Description" },
  { id: "homepage_fixer_cta_button", section: "homepage", type: "text", value: "Sign up as a fixer", label: "Fixer CTA Button" },
  { id: "homepage_fixer_cta_footnote", section: "homepage", type: "text", value: "💶 Average fixer earns €500/month", label: "Fixer CTA Footnote" },
];

// ─── How It Works (dedicated page) ──────────────────────
export const howItWorksDefaults: ContentItem[] = [
  { id: "hiw_hero_subtitle", section: "how_it_works", type: "text", value: "Connect with local repair people in just a few simple steps. Save money, save the planet, support local businesses.", label: "Hero Subtitle" },
  { id: "hiw_tab_customers", section: "how_it_works", type: "text", value: "For Customers", label: "Tab - Customers" },
  { id: "hiw_tab_fixers", section: "how_it_works", type: "text", value: "For Fixers", label: "Tab - Fixers" },

  // Fixer steps
  { id: "hiw_fixer_step1_title", section: "how_it_works", type: "text", value: "Create your profile", label: "Fixer Step 1 Title" },
  { id: "hiw_fixer_step1_desc", section: "how_it_works", type: "text", value: "Sign up with your KVK number, add your skills, and set your service area to start receiving jobs.", label: "Fixer Step 1 Description" },
  { id: "hiw_fixer_step2_title", section: "how_it_works", type: "text", value: "Browse repair requests", label: "Fixer Step 2 Title" },
  { id: "hiw_fixer_step2_desc", section: "how_it_works", type: "text", value: "See nearby jobs matching your skills. Filter by category, location, and urgency.", label: "Fixer Step 2 Description" },
  { id: "hiw_fixer_step3_title", section: "how_it_works", type: "text", value: "Make offers", label: "Fixer Step 3 Title" },
  { id: "hiw_fixer_step3_desc", section: "how_it_works", type: "text", value: "Send your price and estimated repair time to customers. Explain what you'll do to fix the problem.", label: "Fixer Step 3 Description" },
  { id: "hiw_fixer_step4_title", section: "how_it_works", type: "text", value: "Fix & get paid", label: "Fixer Step 4 Title" },
  { id: "hiw_fixer_step4_desc", section: "how_it_works", type: "text", value: "Complete the repair, customer confirms the work, and money is transferred to your account automatically.", label: "Fixer Step 4 Description" },

  // FAQ
  { id: "hiw_faq_title", section: "how_it_works", type: "text", value: "Frequently Asked Questions", label: "FAQ Title" },
  { id: "hiw_faq1_q", section: "how_it_works", type: "text", value: "How much does FixMe cost?", label: "FAQ 1 Question" },
  { id: "hiw_faq1_a", section: "how_it_works", type: "text", value: "Posting repair requests is completely free for customers. Fixers pay a 15% commission on each completed job. This helps us keep the platform running and safe for everyone.", label: "FAQ 1 Answer" },
  { id: "hiw_faq2_q", section: "how_it_works", type: "text", value: "How is my payment protected?", label: "FAQ 2 Question" },
  { id: "hiw_faq2_a", section: "how_it_works", type: "text", value: "We use an escrow system. When you accept an offer, your payment is held safely by FixMe. The money is only released to the fixer after you confirm the repair is complete. If something goes wrong, you can open a dispute within 48 hours.", label: "FAQ 2 Answer" },
  { id: "hiw_faq3_q", section: "how_it_works", type: "text", value: "What if the repair goes wrong?", label: "FAQ 3 Question" },
  { id: "hiw_faq3_a", section: "how_it_works", type: "text", value: "You have 48 hours after completion to open a dispute if the repair wasn't done properly or if there's damage. Our admin team reviews the case, looks at evidence from both sides, and makes a fair decision. Refunds are processed within 5-7 business days.", label: "FAQ 3 Answer" },
  { id: "hiw_faq4_q", section: "how_it_works", type: "text", value: "Do I need a KVK number to be a fixer?", label: "FAQ 4 Question" },
  { id: "hiw_faq4_a", section: "how_it_works", type: "text", value: "Yes. In the Netherlands, anyone offering repair services professionally must be registered with the KVK (Chamber of Commerce). This is a legal requirement and helps ensure all fixers on FixMe are legitimate businesses.", label: "FAQ 4 Answer" },
  { id: "hiw_faq5_q", section: "how_it_works", type: "text", value: "What areas does FixMe cover?", label: "FAQ 5 Question" },
  { id: "hiw_faq5_a", section: "how_it_works", type: "text", value: "We're currently active in Amsterdam and surrounding areas. We're expanding to Rotterdam, Utrecht, and The Hague soon. Sign up now and we'll notify you when FixMe launches in your city!", label: "FAQ 5 Answer" },
  { id: "hiw_faq6_q", section: "how_it_works", type: "text", value: "How fast will I get offers?", label: "FAQ 6 Question" },
  { id: "hiw_faq6_a", section: "how_it_works", type: "text", value: "Most repair requests receive their first offer within a few hours. Urgent requests often get offers even faster. You can also mark your request as 'Priority' to make it more visible to fixers in your area.", label: "FAQ 6 Answer" },
  { id: "hiw_faq7_q", section: "how_it_works", type: "text", value: "What items can I post for repair?", label: "FAQ 7 Question" },
  { id: "hiw_faq7_a", section: "how_it_works", type: "text", value: "Almost anything! Common categories include bikes, phones, laptops, appliances, furniture, clothing, and electronics. As long as it's legal and fixable, you can post it. No cars or large construction work though.", label: "FAQ 7 Answer" },
  { id: "hiw_faq8_q", section: "how_it_works", type: "text", value: "Can I cancel a request or offer?", label: "FAQ 8 Question" },
  { id: "hiw_faq8_a", section: "how_it_works", type: "text", value: "Yes. Customers can cancel requests anytime before accepting an offer. Fixers can withdraw offers before they're accepted. Once an offer is accepted and payment is made, cancellation requires mutual agreement or a dispute process.", label: "FAQ 8 Answer" },

  // CTA
  { id: "hiw_cta_title", section: "how_it_works", type: "text", value: "Ready to get started?", label: "CTA Title" },
  { id: "hiw_cta_desc", section: "how_it_works", type: "text", value: "Join thousands of people who choose to repair instead of replace.", label: "CTA Description" },
  { id: "hiw_cta_post_button", section: "how_it_works", type: "text", value: "Post a Repair Request", label: "CTA Post Button" },
  { id: "hiw_cta_fixer_button", section: "how_it_works", type: "text", value: "Become a Fixer", label: "CTA Fixer Button" },
];

// ─── Footer ──────────────────────────────────────────────
export const footerDefaults: ContentItem[] = [
  { id: "footer_about", section: "footer", type: "text", value: "FixMe is a Dutch repair marketplace connecting people who need repairs with local skilled fixers. We believe in sustainability and keeping things out of landfills.", label: "Footer About Text" },
  { id: "footer_tagline", section: "footer", type: "text", value: "Repair, Reuse, Reduce Waste", label: "Footer Tagline" },
  { id: "footer_copyright", section: "footer", type: "text", value: "© 2024 FixMe. All rights reserved.", label: "Footer Copyright" },
];

// ─── Login ───────────────────────────────────────────────
export const loginDefaults: ContentItem[] = [
  { id: "login_logo", section: "login", type: "text", value: "FixMe", label: "Logo Text" },
  { id: "login_title", section: "login", type: "text", value: "Welcome back", label: "Page Title" },
  { id: "login_email_label", section: "login", type: "text", value: "Email", label: "Email Label" },
  { id: "login_email_placeholder", section: "login", type: "text", value: "your@email.com", label: "Email Placeholder" },
  { id: "login_password_label", section: "login", type: "text", value: "Password", label: "Password Label" },
  { id: "login_password_placeholder", section: "login", type: "text", value: "••••••••", label: "Password Placeholder" },
  { id: "login_submit", section: "login", type: "text", value: "Log in", label: "Submit Button" },
  { id: "login_divider", section: "login", type: "text", value: "or", label: "OAuth Divider" },
  { id: "login_google", section: "login", type: "text", value: "Continue with Google", label: "Google Button" },
  { id: "login_register_prompt", section: "login", type: "text", value: "Don't have an account?", label: "Register Prompt" },
  { id: "login_register_link", section: "login", type: "text", value: "Register", label: "Register Link" },
  { id: "login_error_credentials", section: "login", type: "text", value: "Invalid email or password", label: "Error - Invalid Credentials" },
  { id: "login_error_generic", section: "login", type: "text", value: "Something went wrong. Please try again.", label: "Error - Generic" },
  { id: "login_error_google", section: "login", type: "text", value: "Google sign-in is not available right now. Please sign in with email and password instead.", label: "Error - Google Unavailable" },
];

// ─── Register ────────────────────────────────────────────
export const registerDefaults: ContentItem[] = [
  { id: "register_logo", section: "register", type: "text", value: "FixMe", label: "Logo Text" },
  { id: "register_title", section: "register", type: "text", value: "Create your account", label: "Page Title" },
  { id: "register_name_label", section: "register", type: "text", value: "Name", label: "Name Label" },
  { id: "register_name_placeholder", section: "register", type: "text", value: "Your name", label: "Name Placeholder" },
  { id: "register_email_label", section: "register", type: "text", value: "Email", label: "Email Label" },
  { id: "register_email_placeholder", section: "register", type: "text", value: "your@email.com", label: "Email Placeholder" },
  { id: "register_password_label", section: "register", type: "text", value: "Password", label: "Password Label" },
  { id: "register_password_placeholder", section: "register", type: "text", value: "Minimum 8 characters", label: "Password Placeholder" },
  { id: "register_type_label", section: "register", type: "text", value: "I want to", label: "User Type Label" },
  { id: "register_type_customer", section: "register", type: "text", value: "Get something fixed", label: "User Type - Customer" },
  { id: "register_type_fixer", section: "register", type: "text", value: "Fix things for people", label: "User Type - Fixer" },
  { id: "register_submit", section: "register", type: "text", value: "Create account", label: "Submit Button" },
  { id: "register_divider", section: "register", type: "text", value: "or", label: "OAuth Divider" },
  { id: "register_google", section: "register", type: "text", value: "Sign up with Google", label: "Google Button" },
  { id: "register_login_prompt", section: "register", type: "text", value: "Already have an account?", label: "Login Prompt" },
  { id: "register_login_link", section: "register", type: "text", value: "Log in", label: "Login Link" },
  { id: "register_error_name", section: "register", type: "text", value: "Name is required", label: "Error - Name Required" },
  { id: "register_error_email_required", section: "register", type: "text", value: "Email is required", label: "Error - Email Required" },
  { id: "register_error_email_invalid", section: "register", type: "text", value: "Email is invalid", label: "Error - Email Invalid" },
  { id: "register_error_password_required", section: "register", type: "text", value: "Password is required", label: "Error - Password Required" },
  { id: "register_error_password_short", section: "register", type: "text", value: "Password must be at least 8 characters", label: "Error - Password Too Short" },
  { id: "register_error_failed", section: "register", type: "text", value: "Registration failed", label: "Error - Registration Failed" },
  { id: "register_error_login_after", section: "register", type: "text", value: "Registration successful but login failed. Please try logging in.", label: "Error - Login After Register" },
  { id: "register_error_generic", section: "register", type: "text", value: "Something went wrong. Please try again.", label: "Error - Generic" },
  { id: "register_error_google", section: "register", type: "text", value: "Google sign-in is not available right now. Please sign up with email and password instead.", label: "Error - Google Unavailable" },
];

// ─── Browse ──────────────────────────────────────────────
export const browseDefaults: ContentItem[] = [
  { id: "browse_title", section: "browse", type: "text", value: "Browse repair requests", label: "Page Title" },
  { id: "browse_search_placeholder", section: "browse", type: "text", value: "Search by keyword...", label: "Search Placeholder" },
  { id: "browse_filter_category", section: "browse", type: "text", value: "Category", label: "Filter - Category Label" },
  { id: "browse_filter_category_all", section: "browse", type: "text", value: "All categories", label: "Filter - All Categories" },
  { id: "browse_filter_timeline", section: "browse", type: "text", value: "Timeline", label: "Filter - Timeline Label" },
  { id: "browse_filter_timeline_all", section: "browse", type: "text", value: "All", label: "Filter - Timeline All" },
  { id: "browse_filter_timeline_urgent", section: "browse", type: "text", value: "Urgent", label: "Filter - Urgent" },
  { id: "browse_filter_timeline_week", section: "browse", type: "text", value: "This week", label: "Filter - This Week" },
  { id: "browse_filter_timeline_no_rush", section: "browse", type: "text", value: "No rush", label: "Filter - No Rush" },
  { id: "browse_filter_mobility", section: "browse", type: "text", value: "Mobility", label: "Filter - Mobility Label" },
  { id: "browse_filter_mobility_all", section: "browse", type: "text", value: "All", label: "Filter - Mobility All" },
  { id: "browse_filter_mobility_bring", section: "browse", type: "text", value: "Bring to fixer", label: "Filter - Bring to Fixer" },
  { id: "browse_filter_mobility_comes", section: "browse", type: "text", value: "Fixer comes to me", label: "Filter - Fixer Comes to Me" },
  { id: "browse_filter_city", section: "browse", type: "text", value: "City", label: "Filter - City Label" },
  { id: "browse_filter_city_all", section: "browse", type: "text", value: "All cities", label: "Filter - All Cities" },
  { id: "browse_sort_label", section: "browse", type: "text", value: "Sort by:", label: "Sort Label" },
  { id: "browse_sort_newest", section: "browse", type: "text", value: "Newest first", label: "Sort - Newest" },
  { id: "browse_sort_oldest", section: "browse", type: "text", value: "Oldest first", label: "Sort - Oldest" },
  { id: "browse_sort_nearest", section: "browse", type: "text", value: "Nearest first", label: "Sort - Nearest" },
  { id: "browse_clear_filters", section: "browse", type: "text", value: "Clear filters", label: "Clear Filters Button" },
  { id: "browse_loading", section: "browse", type: "text", value: "Loading...", label: "Loading State" },
  { id: "browse_results_count", section: "browse", type: "text", value: "{n} repair requests found", label: "Results Count" },
  { id: "browse_view_list", section: "browse", type: "text", value: "List", label: "View - List" },
  { id: "browse_view_map", section: "browse", type: "text", value: "Map", label: "View - Map" },
  { id: "browse_map_loading", section: "browse", type: "text", value: "Loading map...", label: "Map Loading" },
  { id: "browse_map_empty", section: "browse", type: "text", value: "No locations to show", label: "Map Empty Title" },
  { id: "browse_map_empty_desc", section: "browse", type: "text", value: "Try different filters to see repair requests on the map", label: "Map Empty Description" },
  { id: "browse_empty_title", section: "browse", type: "text", value: "No repair requests found", label: "Empty State Title" },
  { id: "browse_empty_desc", section: "browse", type: "text", value: "Try different filters or post your own!", label: "Empty State Description" },
  { id: "browse_empty_cta", section: "browse", type: "text", value: "Post a request", label: "Empty State CTA" },
  { id: "browse_prev", section: "browse", type: "text", value: "Previous", label: "Pagination - Previous" },
  { id: "browse_next", section: "browse", type: "text", value: "Next", label: "Pagination - Next" },
];

// ─── Post ────────────────────────────────────────────────
export const postDefaults: ContentItem[] = [
  { id: "post_title", section: "post", type: "text", value: "Post a repair request", label: "Page Title" },
  { id: "post_subtitle", section: "post", type: "text", value: "Tell us what's broken and we'll connect you with local fixers", label: "Page Subtitle" },
  { id: "post_step1_label", section: "post", type: "text", value: "Photos", label: "Step 1 Label" },
  { id: "post_step2_label", section: "post", type: "text", value: "Category", label: "Step 2 Label" },
  { id: "post_step3_label", section: "post", type: "text", value: "Details", label: "Step 3 Label" },
  { id: "post_loading", section: "post", type: "text", value: "Loading...", label: "Loading State" },
  { id: "post_step1_heading", section: "post", type: "text", value: "Upload photos of your broken item", label: "Step 1 Heading" },
  { id: "post_step1_desc", section: "post", type: "text", value: "Add up to 5 photos. Our AI will analyze them to help diagnose the problem.", label: "Step 1 Description" },
  { id: "post_photo_add", section: "post", type: "text", value: "Add photo", label: "Add Photo Button" },
  { id: "post_step2_heading", section: "post", type: "text", value: "Select a category", label: "Step 2 Heading" },
  { id: "post_ai_suggestion", section: "post", type: "text", value: "✨ AI suggestion: We think this is", label: "AI Suggestion Prefix" },
  { id: "post_step3_heading", section: "post", type: "text", value: "Add details", label: "Step 3 Heading" },
  { id: "post_field_title_label", section: "post", type: "text", value: "Title *", label: "Title Field Label" },
  { id: "post_field_title_placeholder", section: "post", type: "text", value: "e.g. Broken bike chain", label: "Title Field Placeholder" },
  { id: "post_field_desc_label", section: "post", type: "text", value: "Description *", label: "Description Field Label" },
  { id: "post_field_desc_placeholder", section: "post", type: "text", value: "Describe what's broken and any other important details...", label: "Description Field Placeholder" },
  { id: "post_field_location_label", section: "post", type: "text", value: "Location *", label: "Location Field Label" },
  { id: "post_field_location_hint", section: "post", type: "text", value: "Click on the map or search for your address", label: "Location Hint" },
  { id: "post_location_manual", section: "post", type: "text", value: "Or enter manually", label: "Location Manual Toggle" },
  { id: "post_city_placeholder", section: "post", type: "text", value: "City (e.g. Amsterdam)", label: "City Placeholder" },
  { id: "post_address_placeholder", section: "post", type: "text", value: "Street address (optional)", label: "Address Placeholder" },
  { id: "post_timeline_label", section: "post", type: "text", value: "When do you need it fixed? *", label: "Timeline Label" },
  { id: "post_timeline_urgent", section: "post", type: "text", value: "Urgent (within 24 hours)", label: "Timeline - Urgent" },
  { id: "post_timeline_week", section: "post", type: "text", value: "This week", label: "Timeline - This Week" },
  { id: "post_timeline_no_rush", section: "post", type: "text", value: "No rush", label: "Timeline - No Rush" },
  { id: "post_mobility_label", section: "post", type: "text", value: "How will the repair happen? *", label: "Mobility Label" },
  { id: "post_mobility_bring", section: "post", type: "text", value: "I'll bring it to the fixer", label: "Mobility - Bring to Fixer" },
  { id: "post_mobility_comes", section: "post", type: "text", value: "Fixer comes to my location", label: "Mobility - Fixer Comes" },
  { id: "post_back_button", section: "post", type: "text", value: "Back", label: "Back Button" },
  { id: "post_continue_button", section: "post", type: "text", value: "Continue", label: "Continue Button" },
  { id: "post_submitting", section: "post", type: "text", value: "Submitting...", label: "Submitting Button" },
  { id: "post_submit_button", section: "post", type: "text", value: "Post request", label: "Submit Button" },
  { id: "post_error_max_photos", section: "post", type: "text", value: "Maximum 5 photos allowed", label: "Error - Max Photos" },
  { id: "post_error_no_photos", section: "post", type: "text", value: "Please upload at least one photo", label: "Error - No Photos" },
  { id: "post_error_no_category", section: "post", type: "text", value: "Please select a category", label: "Error - No Category" },
  { id: "post_error_no_title", section: "post", type: "text", value: "Please enter a title", label: "Error - No Title" },
  { id: "post_error_no_desc", section: "post", type: "text", value: "Please enter a description", label: "Error - No Description" },
  { id: "post_error_no_city", section: "post", type: "text", value: "Please enter your city", label: "Error - No City" },
  { id: "post_error_ai", section: "post", type: "text", value: "Failed to analyze photos. Please continue manually.", label: "Error - AI Diagnosis" },
  { id: "post_error_submit", section: "post", type: "text", value: "Failed to submit request. Please try again.", label: "Error - Submit" },
  { id: "post_map_loading", section: "post", type: "text", value: "Loading map...", label: "Map Loading" },
];

// ─── Settings ────────────────────────────────────────────
export const settingsDefaults: ContentItem[] = [
  { id: "settings_title", section: "settings", type: "text", value: "Settings", label: "Page Title" },
  { id: "settings_loading", section: "settings", type: "text", value: "Loading...", label: "Loading State" },

  // Account
  { id: "settings_account_title", section: "settings", type: "text", value: "Account", label: "Account Section Title" },
  { id: "settings_email_label", section: "settings", type: "text", value: "Email", label: "Email Label" },
  { id: "settings_change_password", section: "settings", type: "text", value: "Change password", label: "Change Password Button" },
  { id: "settings_current_password", section: "settings", type: "text", value: "Current password", label: "Current Password Label" },
  { id: "settings_new_password", section: "settings", type: "text", value: "New password", label: "New Password Label" },
  { id: "settings_confirm_password", section: "settings", type: "text", value: "Confirm new password", label: "Confirm Password Label" },
  { id: "settings_password_updating", section: "settings", type: "text", value: "Updating...", label: "Password Updating Button" },
  { id: "settings_password_update", section: "settings", type: "text", value: "Update password", label: "Update Password Button" },
  { id: "settings_connected_accounts", section: "settings", type: "text", value: "Connected accounts", label: "Connected Accounts Label" },
  { id: "settings_connected_badge", section: "settings", type: "text", value: "Connected", label: "Connected Badge" },
  { id: "settings_connect_button", section: "settings", type: "text", value: "Connect", label: "Connect Button" },

  // Notifications
  { id: "settings_notif_title", section: "settings", type: "text", value: "Notifications", label: "Notifications Section Title" },
  { id: "settings_notif_offers", section: "settings", type: "text", value: "Email notifications for new offers", label: "Notification - Offers" },
  { id: "settings_notif_offers_desc", section: "settings", type: "text", value: "Get notified when fixers send you offers", label: "Notification - Offers Description" },
  { id: "settings_notif_messages", section: "settings", type: "text", value: "Email notifications for messages", label: "Notification - Messages" },
  { id: "settings_notif_messages_desc", section: "settings", type: "text", value: "Get notified when you receive new messages", label: "Notification - Messages Description" },
  { id: "settings_notif_jobs", section: "settings", type: "text", value: "Email notifications for job updates", label: "Notification - Job Updates" },
  { id: "settings_notif_jobs_desc", section: "settings", type: "text", value: "Get notified about job status changes", label: "Notification - Job Updates Description" },
  { id: "settings_notif_reviews", section: "settings", type: "text", value: "Email notifications for reviews", label: "Notification - Reviews" },
  { id: "settings_notif_reviews_desc", section: "settings", type: "text", value: "Get notified when you receive reviews", label: "Notification - Reviews Description" },
  { id: "settings_notif_inapp_note", section: "settings", type: "text", value: "In-app notifications are always on", label: "In-App Notification Note" },

  // Privacy
  { id: "settings_privacy_title", section: "settings", type: "text", value: "Privacy", label: "Privacy Section Title" },
  { id: "settings_privacy_city", section: "settings", type: "text", value: "Show my city on my profile", label: "Privacy - Show City" },
  { id: "settings_privacy_city_desc", section: "settings", type: "text", value: "Others can see which city you're in", label: "Privacy - City Description" },
  { id: "settings_privacy_phone", section: "settings", type: "text", value: "Show my phone number to fixers after accepting an offer", label: "Privacy - Show Phone" },
  { id: "settings_privacy_phone_desc", section: "settings", type: "text", value: "Fixers can contact you directly after you accept their offer", label: "Privacy - Phone Description" },

  // Language
  { id: "settings_language_title", section: "settings", type: "text", value: "Language", label: "Language Section Title" },
  { id: "settings_language_label", section: "settings", type: "text", value: "Preferred language", label: "Language Label" },
  { id: "settings_language_english", section: "settings", type: "text", value: "English", label: "Language - English" },
  { id: "settings_language_dutch", section: "settings", type: "text", value: "Nederlands", label: "Language - Dutch" },

  // Danger Zone
  { id: "settings_danger_title", section: "settings", type: "text", value: "Danger Zone", label: "Danger Zone Title" },
  { id: "settings_delete_button", section: "settings", type: "text", value: "Delete my account", label: "Delete Account Button" },
  { id: "settings_delete_modal_title", section: "settings", type: "text", value: "Delete Account", label: "Delete Modal Title" },
  { id: "settings_delete_modal_body", section: "settings", type: "text", value: "Are you sure? This will permanently delete your account and all your data. This cannot be undone.", label: "Delete Modal Body" },
  { id: "settings_delete_confirm_label", section: "settings", type: "text", value: "Type DELETE to confirm", label: "Delete Confirm Label" },
  { id: "settings_deleting", section: "settings", type: "text", value: "Deleting...", label: "Deleting Button" },

  // Messages
  { id: "settings_error_mismatch", section: "settings", type: "text", value: "Passwords do not match", label: "Error - Password Mismatch" },
  { id: "settings_error_password_short", section: "settings", type: "text", value: "Password must be at least 8 characters", label: "Error - Password Too Short" },
  { id: "settings_password_success", section: "settings", type: "text", value: "Password updated successfully!", label: "Password Update Success" },
  { id: "settings_error_password", section: "settings", type: "text", value: "Failed to update password", label: "Error - Password Update" },
  { id: "settings_error_generic", section: "settings", type: "text", value: "An error occurred. Please try again.", label: "Error - Generic" },
];

// ─── Navbar ──────────────────────────────────────────────
export const navbarDefaults: ContentItem[] = [
  { id: "navbar_logo", section: "navbar", type: "text", value: "FixMe", label: "Logo Text" },
  { id: "navbar_search_placeholder", section: "navbar", type: "text", value: "Search for repairs...", label: "Search Placeholder" },
  { id: "navbar_post_request", section: "navbar", type: "text", value: "Post a request", label: "Post Request Button" },
  { id: "navbar_dashboard", section: "navbar", type: "text", value: "Dashboard", label: "Dashboard Link" },
  { id: "navbar_my_profile", section: "navbar", type: "text", value: "My Profile", label: "My Profile Link" },
  { id: "navbar_settings", section: "navbar", type: "text", value: "Settings", label: "Settings Link" },
  { id: "navbar_logout", section: "navbar", type: "text", value: "Log out", label: "Logout Button" },
  { id: "navbar_login", section: "navbar", type: "text", value: "Log in", label: "Login Link" },
  { id: "navbar_register", section: "navbar", type: "text", value: "Register", label: "Register Button" },
];

// ─── Bottom Nav ──────────────────────────────────────────
export const bottomNavDefaults: ContentItem[] = [
  { id: "bottomnav_home", section: "bottomnav", type: "text", value: "Home", label: "Home Label" },
  { id: "bottomnav_search", section: "bottomnav", type: "text", value: "Search", label: "Search Label" },
  { id: "bottomnav_post", section: "bottomnav", type: "text", value: "Post", label: "Post Label" },
  { id: "bottomnav_messages", section: "bottomnav", type: "text", value: "Messages", label: "Messages Label" },
  { id: "bottomnav_profile", section: "bottomnav", type: "text", value: "Profile", label: "Profile Label" },
];

// ─── My Requests ─────────────────────────────────────────
export const myRequestsDefaults: ContentItem[] = [
  { id: "my_requests_title", section: "my_requests", type: "text", value: "My Requests", label: "Page Title" },
  { id: "my_requests_subtitle", section: "my_requests", type: "text", value: "View and manage all your repair requests", label: "Page Subtitle" },
  { id: "my_requests_loading", section: "my_requests", type: "text", value: "Loading your requests...", label: "Loading State" },
  { id: "my_requests_filter_heading", section: "my_requests", type: "text", value: "Filter by status", label: "Filter Heading" },
  { id: "my_requests_empty_none", section: "my_requests", type: "text", value: "You haven't posted any requests yet.", label: "Empty - No Requests" },
  { id: "my_requests_empty_filtered", section: "my_requests", type: "text", value: "No requests match your filters.", label: "Empty - Filtered" },
  { id: "my_requests_empty_cta", section: "my_requests", type: "text", value: "Post a request", label: "Empty State CTA" },
  { id: "my_requests_offer_singular", section: "my_requests", type: "text", value: "offer", label: "Offer - Singular" },
  { id: "my_requests_offer_plural", section: "my_requests", type: "text", value: "offers", label: "Offer - Plural" },
  { id: "my_requests_showing", section: "my_requests", type: "text", value: "Showing {n} of {total} requests", label: "Stats - Showing" },
  { id: "my_requests_total_offers", section: "my_requests", type: "text", value: "Total offers received:", label: "Stats - Total Offers" },
];

// ─── Notifications ───────────────────────────────────────
export const notificationsDefaults: ContentItem[] = [
  { id: "notifications_title", section: "notifications", type: "text", value: "Notifications", label: "Page Title" },
  { id: "notifications_loading", section: "notifications", type: "text", value: "Loading notifications...", label: "Loading State" },
  { id: "notifications_marking", section: "notifications", type: "text", value: "Marking...", label: "Marking Button" },
  { id: "notifications_mark_all", section: "notifications", type: "text", value: "Mark all as read", label: "Mark All Read Button" },
  { id: "notifications_empty_title", section: "notifications", type: "text", value: "No notifications yet", label: "Empty State Title" },
  { id: "notifications_empty_desc", section: "notifications", type: "text", value: "We'll notify you when something important happens", label: "Empty State Description" },
  { id: "notifications_unread_badge", section: "notifications", type: "text", value: "NEW", label: "Unread Badge" },
];

// ─── Profile Edit ────────────────────────────────────────
export const profileEditDefaults: ContentItem[] = [
  { id: "profile_edit_title", section: "profile_edit", type: "text", value: "Edit Profile", label: "Page Title" },
  { id: "profile_edit_loading", section: "profile_edit", type: "text", value: "Loading...", label: "Loading State" },
  { id: "profile_edit_change_photo", section: "profile_edit", type: "text", value: "Change photo", label: "Change Photo Button" },
  { id: "profile_edit_name_label", section: "profile_edit", type: "text", value: "Name *", label: "Name Label" },
  { id: "profile_edit_email_label", section: "profile_edit", type: "text", value: "Email", label: "Email Label" },
  { id: "profile_edit_email_hint", section: "profile_edit", type: "text", value: "Contact support to change email", label: "Email Hint" },
  { id: "profile_edit_phone_label", section: "profile_edit", type: "text", value: "Phone number", label: "Phone Label" },
  { id: "profile_edit_phone_placeholder", section: "profile_edit", type: "text", value: "+31 6 12345678", label: "Phone Placeholder" },
  { id: "profile_edit_city_label", section: "profile_edit", type: "text", value: "City", label: "City Label" },
  { id: "profile_edit_city_placeholder", section: "profile_edit", type: "text", value: "Amsterdam", label: "City Placeholder" },

  // Fixer section
  { id: "profile_edit_fixer_heading", section: "profile_edit", type: "text", value: "Fixer Profile", label: "Fixer Section Heading" },
  { id: "profile_edit_kvk_label", section: "profile_edit", type: "text", value: "KVK Number", label: "KVK Label" },
  { id: "profile_edit_kvk_placeholder", section: "profile_edit", type: "text", value: "12345678", label: "KVK Placeholder" },
  { id: "profile_edit_kvk_verified", section: "profile_edit", type: "text", value: "Verified", label: "KVK Verified Badge" },
  { id: "profile_edit_kvk_pending", section: "profile_edit", type: "text", value: "Pending verification", label: "KVK Pending" },
  { id: "profile_edit_bio_label", section: "profile_edit", type: "text", value: "Bio", label: "Bio Label" },
  { id: "profile_edit_bio_placeholder", section: "profile_edit", type: "text", value: "Tell customers about yourself, your experience, and what you can fix.", label: "Bio Placeholder" },
  { id: "profile_edit_skills_label", section: "profile_edit", type: "text", value: "Skills / Categories", label: "Skills Label" },
  { id: "profile_edit_service_area", section: "profile_edit", type: "text", value: "Service area: {n} km", label: "Service Area Label" },
  { id: "profile_edit_min_fee_label", section: "profile_edit", type: "text", value: "Minimum job fee", label: "Min Fee Label" },
  { id: "profile_edit_min_fee_hint", section: "profile_edit", type: "text", value: "You won't see requests below this amount", label: "Min Fee Hint" },
  { id: "profile_edit_available", section: "profile_edit", type: "text", value: "Available for jobs", label: "Available Toggle" },
  { id: "profile_edit_available_hint", section: "profile_edit", type: "text", value: "Turn off to hide from search results", label: "Available Hint" },

  // Buttons & messages
  { id: "profile_edit_saving", section: "profile_edit", type: "text", value: "Saving...", label: "Saving Button" },
  { id: "profile_edit_save", section: "profile_edit", type: "text", value: "Save changes", label: "Save Button" },
  { id: "profile_edit_success", section: "profile_edit", type: "text", value: "Profile updated successfully!", label: "Success Message" },
  { id: "profile_edit_error", section: "profile_edit", type: "text", value: "Failed to update profile", label: "Error - Generic" },
  { id: "profile_edit_error_server", section: "profile_edit", type: "text", value: "An error occurred. Please try again.", label: "Error - Server" },
];

// ─── Categories Page ─────────────────────────────────────
export const categoriesDefaults: ContentItem[] = [
  { id: "categories_page_title", section: "categories", type: "text", value: "All categories", label: "Page Title" },
  { id: "categories_page_subtitle", section: "categories", type: "text", value: "What needs fixing?", label: "Page Subtitle" },
  { id: "categories_count_zero", section: "categories", type: "text", value: "No requests yet", label: "Count - Zero" },
  { id: "categories_count_singular", section: "categories", type: "text", value: "1 active request", label: "Count - Singular" },
  { id: "categories_count_plural", section: "categories", type: "text", value: "{n} active requests", label: "Count - Plural" },
  { id: "categories_empty", section: "categories", type: "text", value: "No categories available yet.", label: "Empty State" },
];

// ─── Category Detail ─────────────────────────────────────
export const categoryDetailDefaults: ContentItem[] = [
  { id: "category_count_zero", section: "category_detail", type: "text", value: "No active requests", label: "Count - Zero" },
  { id: "category_count_singular", section: "category_detail", type: "text", value: "1 active request", label: "Count - Singular" },
  { id: "category_count_plural", section: "category_detail", type: "text", value: "{n} active requests", label: "Count - Plural" },
  { id: "category_requests_heading", section: "category_detail", type: "text", value: "Repair requests in {category}", label: "Requests Heading" },
  { id: "category_empty_title", section: "category_detail", type: "text", value: "No repair requests yet in this category", label: "Empty State Title" },
  { id: "category_empty_desc", section: "category_detail", type: "text", value: "Be the first to post one!", label: "Empty State Description" },
  { id: "category_empty_cta", section: "category_detail", type: "text", value: "Post a request", label: "Empty State CTA" },
];

// ─── About Page ──────────────────────────────────────────
export const aboutDefaults: ContentItem[] = [
  { id: "about_hero_title", section: "about", type: "text", value: "About FixMe", label: "Hero Title" },
  { id: "about_hero_subtitle", section: "about", type: "text", value: "We're on a mission to make repair accessible for everyone", label: "Hero Subtitle" },
  { id: "about_mission_title", section: "about", type: "text", value: "Our Mission", label: "Mission Title" },
  { id: "about_mission_text", section: "about", type: "text", value: "FixMe was born from a simple idea: why throw things away when they can be fixed? We connect people who need repairs with skilled local fixers, making it easy, safe, and affordable to extend the life of your belongings.", label: "Mission Text" },
  { id: "about_values_title", section: "about", type: "text", value: "Our Values", label: "Values Title" },
  { id: "about_value1_title", section: "about", type: "text", value: "Sustainability", label: "Value 1 Title" },
  { id: "about_value1_desc", section: "about", type: "text", value: "Every repair keeps items out of landfills", label: "Value 1 Description" },
  { id: "about_value2_title", section: "about", type: "text", value: "Community", label: "Value 2 Title" },
  { id: "about_value2_desc", section: "about", type: "text", value: "Supporting local skilled workers", label: "Value 2 Description" },
  { id: "about_value3_title", section: "about", type: "text", value: "Trust", label: "Value 3 Title" },
  { id: "about_value3_desc", section: "about", type: "text", value: "Verified fixers and secure payments", label: "Value 3 Description" },
];

// ─── Contact Page ────────────────────────────────────────
export const contactDefaults: ContentItem[] = [
  { id: "contact_hero_title", section: "contact", type: "text", value: "Get in Touch", label: "Hero Title" },
  { id: "contact_hero_subtitle", section: "contact", type: "text", value: "We'd love to hear from you", label: "Hero Subtitle" },
  { id: "contact_email", section: "contact", type: "text", value: "support@fixme.nl", label: "Contact Email" },
  { id: "contact_phone", section: "contact", type: "text", value: "+31 20 123 4567", label: "Contact Phone" },
  { id: "contact_address", section: "contact", type: "text", value: "Amsterdam, Netherlands", label: "Contact Address" },
];

// ─── Terms (markdown) ────────────────────────────────────
const TERMS_MD = `## 1. About FixMe

FixMe is an online marketplace that connects people who need repairs with local repair professionals ("Fixers"). We provide the platform, but we are not a repair company ourselves.

All repairs are performed by independent Fixers. FixMe acts as an intermediary and payment processor, but we are not responsible for the quality or outcome of any repair work.

## 2. Account Registration

To use FixMe, you must create an account. By registering, you agree to:

- Be at least 18 years old
- Provide accurate and complete information
- Keep your account credentials secure
- Have only one account per person
- Not share your account with others or let anyone else use it

We reserve the right to suspend or delete accounts that violate these terms or engage in fraudulent activity.

## 3. For Customers

As a customer posting repair requests, you agree to:

- Provide accurate descriptions and photos of items needing repair
- Only post items that you own or have permission to repair
- Pay for accepted offers according to the agreed price and terms
- Be available and responsive to communicate with your chosen Fixer
- Confirm completion of work within 48 hours, or open a dispute if needed
- Not post illegal, stolen, or prohibited items

Posting repair requests is free. You only pay when you accept an offer from a Fixer.

## 4. For Fixers

As a Fixer offering repair services, you agree to:

- Have a valid KVK (Chamber of Commerce) registration number
- Be legally authorized to operate a business in the Netherlands
- Provide honest and realistic estimates for repair work
- Complete repairs to a professional standard and within the agreed timeframe
- Communicate clearly with customers throughout the repair process
- Comply with all applicable laws, regulations, and safety standards

You are an independent contractor, not an employee of FixMe. You are responsible for your own taxes, insurance, and business operations.

## 5. Payments & Fees

**Commission:** FixMe charges Fixers a 15% commission on each completed job. This fee is automatically deducted from the payout.

**Escrow System:** When a customer accepts an offer, payment is held in escrow by FixMe. The money is released to the Fixer only after the customer confirms the repair is complete.

**Automatic Release:** If the customer does not confirm or dispute within 48 hours of the Fixer marking the job as complete, payment is automatically released to the Fixer.

**Refunds:** Refunds are only issued through the dispute process. If a dispute is resolved in favor of the customer, the refund is processed within 5-7 business days.

## 6. Reviews & Ratings

After a job is completed, both customers and Fixers can leave reviews. You agree to:

- Write honest and truthful reviews based on your experience
- Not post fake reviews or ask others to write reviews for you
- Not use reviews to harass, threaten, or defame anyone
- Not include personal information (phone numbers, addresses) in reviews

We reserve the right to remove reviews that violate these rules or contain abusive, offensive, or inappropriate content.

## 7. Disputes

If you're unhappy with a repair, you have 48 hours after the Fixer marks the job as complete to open a dispute.

Our admin team will review evidence from both sides (photos, messages, repair details) and make a final decision. Decisions are binding and cannot be appealed unless new evidence is provided.

Possible outcomes: full refund to customer, partial refund, or no refund if the repair was done correctly.

## 8. Prohibited Content

You may not use FixMe to:

- Post or repair illegal items (stolen goods, weapons, drugs, etc.)
- Spam, scam, or attempt to defraud other users
- Harass, threaten, or abuse other users
- Bypass the platform to avoid paying fees
- Scrape data, use bots, or automated systems without permission
- Impersonate others or create fake accounts

Violations may result in immediate account suspension and, if necessary, reporting to law enforcement.

## 9. Liability

FixMe is a marketplace platform. We are not responsible for:

- The quality, safety, or legality of repairs performed
- The accuracy of repair requests or offers
- Disputes between customers and Fixers
- Loss, damage, or injury resulting from repairs or interactions
- Actions, conduct, or content of users on the platform

**Limitation of Liability:** To the maximum extent permitted by law, FixMe's liability is limited to the amount of fees paid for the specific transaction in question. We are not liable for indirect, incidental, or consequential damages.

Users interact at their own risk. We recommend checking Fixer profiles, ratings, and reviews before accepting offers.

## 10. Privacy

Your use of FixMe is also governed by our [Privacy Policy](/privacy), which explains how we collect, use, and protect your personal data.

## 11. Changes to Terms

We may update these Terms & Conditions from time to time. We'll notify you of significant changes via email or a notice on the platform. Continued use of FixMe after changes means you accept the updated terms.

## 12. Contact

If you have questions about these terms, please contact us at:

**Email:** info@fixme.nl

**Address:** FixMe B.V., Amsterdam, Netherlands`;

export const termsDefaults: ContentItem[] = [
  { id: "terms_title", section: "terms", type: "text", value: "Terms & Conditions", label: "Page Title" },
  { id: "terms_last_updated", section: "terms", type: "text", value: "March 3, 2026", label: "Last Updated Date" },
  { id: "terms_back_link", section: "terms", type: "text", value: "← Back to Home", label: "Back Link" },
  { id: "terms_markdown", section: "terms", type: "markdown", value: TERMS_MD, label: "Terms Content (Markdown)" },
];

// ─── Privacy (markdown) ──────────────────────────────────
const PRIVACY_MD = `## 1. Who We Are

FixMe B.V. is a Dutch company registered in Amsterdam. We operate the FixMe marketplace platform that connects customers with local repair professionals.

**Company Details:**
FixMe B.V.
Amsterdam, Netherlands
KVK Number: [To be assigned]
Email: privacy@fixme.nl

## 2. What Data We Collect

We collect the following types of information:

**Account Information:** Name, email address, phone number, password (encrypted), user type (customer or fixer), city, and profile photo.

**For Fixers Only:** KVK registration number, business name, skills, service area, and bank account details for payouts.

**Repair Requests:** Photos of broken items, descriptions, location (city and approximate address), category, urgency, and AI-generated diagnosis.

**Messages & Communication:** All messages sent between customers and fixers through the platform, including timestamps and read receipts.

**Payment Information:** Transaction history, payment amounts, and payment methods (processed securely by our payment provider).

**Usage Data:** IP address, browser type, device information, pages visited, time spent on the platform, and features used.

## 3. Why We Collect It

We use your personal data to:

- Provide and operate the FixMe platform (account management, matching customers with fixers, facilitating repairs)
- Process payments securely and distribute payouts to fixers
- Send important notifications about your requests, offers, messages, and account activity
- Verify fixer credentials and ensure platform safety
- Handle disputes and provide customer support
- Improve the platform based on usage patterns and feedback
- Comply with legal obligations (tax records, anti-fraud measures)
- Send marketing emails (only if you opt in, and you can unsubscribe anytime)

## 4. Legal Basis

Under EU/Dutch law (GDPR/AVG), we process your data based on:

- **Contract Performance:** Processing is necessary to provide the service you signed up for (posting requests, making offers, processing payments).
- **Legitimate Interest:** We have a legitimate interest in preventing fraud, improving the platform, and ensuring user safety.
- **Consent:** For marketing emails and non-essential cookies, we ask for your explicit consent.
- **Legal Obligation:** We're required by law to keep payment records for 7 years for tax purposes.

## 5. How We Store Data

All data is stored on secure servers located within the European Union. We use industry-standard encryption and security measures to protect your information.

**Security Measures:**

- Passwords are hashed and never stored in plain text
- All connections use SSL/TLS encryption (HTTPS)
- Regular security audits and vulnerability testing
- Access to personal data is restricted to authorized personnel only
- Automated backups with encrypted storage

## 6. Sharing Data

We do not sell your personal data to third parties. We only share data when necessary:

**With Fixers (when you accept an offer):** Your name, phone number, and approximate location are shared so the fixer can contact you and arrange the repair.

**With Customers (when you make an offer):** Your name, profile photo, ratings, and offer details are visible to help them choose a fixer.

**With Payment Processors:** We use trusted payment providers to process transactions securely. They receive only the information needed to complete payments.

**With Law Enforcement:** If required by law or to protect users from fraud or illegal activity.

We **never** sell your data to advertisers or marketing companies.

## 7. Cookies

We use cookies to improve your experience and analyze platform usage:

**Essential Cookies:** Required for the platform to work (login sessions, security). These cannot be disabled.

**Analytics Cookies:** Help us understand how people use FixMe so we can improve it. You can opt out in your browser settings.

You can manage cookie preferences in your browser settings or by contacting us.

## 8. Your Rights (GDPR/AVG)

Under European data protection law, you have the right to:

- **Access:** Request a copy of all personal data we have about you
- **Correction:** Update or correct inaccurate information
- **Deletion:** Request deletion of your account and data (some data may be retained for legal reasons)
- **Data Export:** Download your data in a machine-readable format
- **Withdraw Consent:** Opt out of marketing emails or non-essential cookies anytime
- **Restrict Processing:** Temporarily limit how we use your data
- **Object:** Object to processing based on legitimate interest

To exercise these rights, go to [Settings](/settings) or contact us at privacy@fixme.nl.

## 9. Data Retention

We keep your data for as long as necessary:

- **Active Accounts:** Data is kept while your account is active
- **Closed Accounts:** Most data is deleted within 1 year after account closure
- **Payment Records:** Kept for 7 years as required by Dutch tax law
- **Dispute Records:** Kept for 3 years in case of legal claims
- **Anonymized Analytics:** May be kept indefinitely for research purposes

## 10. Children

FixMe is not intended for users under 18 years old. We do not knowingly collect data from children. If we discover that a child has created an account, we will delete it immediately.

## 11. Changes to This Policy

We may update this Privacy Policy from time to time. We'll notify you of significant changes via email or a prominent notice on the platform. Continued use after changes means you accept the updated policy.

## 12. Contact

If you have questions about this privacy policy or want to exercise your data rights, contact us at:

**Email:** privacy@fixme.nl
**Address:** FixMe B.V., Amsterdam, Netherlands

You can also [delete your account and data](/settings) directly from your account settings.`;

export const privacyDefaults: ContentItem[] = [
  { id: "privacy_title", section: "privacy", type: "text", value: "Privacy Policy", label: "Page Title" },
  { id: "privacy_last_updated", section: "privacy", type: "text", value: "March 3, 2026", label: "Last Updated Date" },
  { id: "privacy_back_link", section: "privacy", type: "text", value: "← Back to Home", label: "Back Link" },
  { id: "privacy_markdown", section: "privacy", type: "markdown", value: PRIVACY_MD, label: "Privacy Content (Markdown)" },
];

// ─── All sections combined ───────────────────────────────
export const ALL_CONTENT_ITEMS: ContentItem[] = [
  ...homepageDefaults,
  ...howItWorksDefaults,
  ...footerDefaults,
  ...loginDefaults,
  ...registerDefaults,
  ...browseDefaults,
  ...postDefaults,
  ...settingsDefaults,
  ...navbarDefaults,
  ...bottomNavDefaults,
  ...myRequestsDefaults,
  ...notificationsDefaults,
  ...profileEditDefaults,
  ...categoriesDefaults,
  ...categoryDetailDefaults,
  ...aboutDefaults,
  ...contactDefaults,
  ...termsDefaults,
  ...privacyDefaults,
];

// ─── Flat default map (id → value) ──────────────────────
export const DEFAULT_CONTENT: Record<string, string> = {};
for (const item of ALL_CONTENT_ITEMS) {
  DEFAULT_CONTENT[item.id] = item.value;
}

// ─── Section lookup ──────────────────────────────────────
const sectionMap: Record<string, ContentItem[]> = {};
for (const item of ALL_CONTENT_ITEMS) {
  if (!sectionMap[item.section]) {
    sectionMap[item.section] = [];
  }
  sectionMap[item.section].push(item);
}

export function getDefaultsForSection(section: string): ContentItem[] {
  return sectionMap[section] || [];
}

export function getDefaultIds(section: string): string[] {
  return getDefaultsForSection(section).map((item) => item.id);
}
