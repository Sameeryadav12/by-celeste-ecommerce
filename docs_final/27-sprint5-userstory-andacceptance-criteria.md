The team used Planning Poker to estimate the complexity of the work. Each backlog item was discussed, and estimates were based on effort, complexity, uncertainty, testing needs, and frontend/backend dependency.

## User Stories and Acceptance Criteria

### Replace Demo Products with Real By Celeste Data

**User Story:**  
As a customer, I want to view real By Celeste product information so that I can trust the store and make informed purchase decisions.

**Acceptance Criteria:**

- Real By Celeste product names, prices, categories, descriptions, images, and ingredients are added where provided by the client.
- Demo or placeholder products are removed from the customer-facing store.
- Product data displays correctly on the shop page, product detail page, cart, checkout, and admin product list.
- Product category filtering/search is checked and works correctly with real product data.
- Missing client product information is documented as outstanding work.

### Checkout Testing and Fixes

**User Story:**  
As a customer, I want a reliable checkout process so that I can complete my purchase without errors.

**Acceptance Criteria:**

- Customer can move from cart to checkout without errors.
- Checkout form validates required fields correctly.
- Square sandbox payment flow works successfully.
- Order confirmation is displayed after successful payment.
- Order details are saved and visible in admin order management.
- Checkout is tested on desktop and mobile.

### Final Bug Fixing

**User Story:**  
As a user, I want the website to work without major issues so that I have a smooth and reliable experience.

**Acceptance Criteria:**

- Bugs are recorded in a bug log.
- Bugs are prioritised by severity.
- Critical and high-priority bugs are fixed before final handover.
- Fixed bugs are retested.
- Remaining low-priority issues are documented in the final status report.

### Wholesale System Finalisation

**User Story:**  
As a business customer, I want to apply for a wholesale account and access wholesale pricing after approval so that I can order products at partner rates.

**Acceptance Criteria:**

- Wholesale registration form includes required business details.
- Wholesale application data is saved correctly.
- New wholesale applications are marked as pending.
- Admin can approve or reject wholesale users.
- Approved wholesale users can access wholesale pricing.
- Retail users cannot see wholesale-only pricing.

### Wholesale Dashboard and Bulk Order Rules

**User Story:**  
As a wholesale customer, I want a simple wholesale dashboard and bulk order rules so that I can manage wholesale ordering efficiently.

**Acceptance Criteria:**

- Approved wholesale users can access a basic wholesale dashboard.
- Dashboard displays relevant wholesale account or order information.
- Wholesale users can use quantity selection for bulk ordering.
- Minimum order quantity rule is added or demonstrated.
- Unauthorised users cannot access wholesale dashboard features.

### Checkout Freight and Email Confirmation Finalisation

**User Story:**  
As a customer, I want to see freight costs and receive order confirmation so that I know the full cost and status of my order.

**Acceptance Criteria:**

- Freight or shipping cost is displayed before payment.
- Freight cost is included in the final checkout total.
- Order confirmation is shown after successful payment.
- Order confirmation email is sent or demonstrated through a working prototype.
- Production email setup and live Australia Post/Sendle integration are documented as future work if not completed.

### Product Image, Ingredient and Gallery Finalisation

**User Story:**  
As a customer, I want to view clear product images, gallery content, and ingredient information so that I can better understand the products and the By Celeste brand.

**Acceptance Criteria:**

- Product images are clear, consistent, and properly sized.
- Product detail pages show ingredient information.
- Ingredient benefits are clear and readable.
- Image/gallery section displays selected By Celeste product or brand images.
- Images and ingredient sections work correctly on desktop and mobile.

### Customer Reviews and Brand Trust Enhancements

**User Story:**  
As a customer, I want to see reviews, feedback, and trust messaging so that I feel confident purchasing from By Celeste.

**Acceptance Criteria:**

- Customer review or testimonial section is visible on the website.
- Reviews or feedback are displayed clearly.
- Brand trust messages such as Australia-made, cruelty-free, natural ingredients, or no animal testing are visible.
- Trust messaging appears on important pages such as homepage, product page, or footer.
- If full customer-submitted reviews are not implemented, managed testimonials are used and future work is documented.

### Contact Page and Customer Enquiry Finalisation

**User Story:**  
As a customer, I want to contact By Celeste easily so that I can ask questions or request a callback.

**Acceptance Criteria:**

- Contact page includes name, email, phone, subject, and message fields.
- Required field validation works correctly.
- Business contact details are clearly visible.
- Customer enquiry is sent, stored, or demonstrated through a working prototype.
- Success or error message is shown after form submission.

### SEO, Performance and Mobile UX Improvements

**User Story:**  
As a customer and business owner, I want the website to load quickly, work smoothly on mobile, and be easier to find online so that the customer experience and business visibility improve.

**Acceptance Criteria:**

- Main pages include meaningful page titles and meta descriptions.
- Product and brand images include alt text.
- Headings are structured clearly.
- Large images are compressed or resized where appropriate.
- Key pages are checked on mobile.
- No major mobile layout overlap or horizontal scrolling remains.

### Admin Analytics and Events Enhancement

**User Story:**  
As the client/admin, I want to view basic store activity and manage events so that I can understand business performance and keep customers informed.

**Acceptance Criteria:**

- Admin can view a simple dashboard summary.
- Summary includes useful values such as total products, total orders, pending orders, or recent orders.
- Admin can add, edit, and delete events.
- Events page displays event title, date, location, and description.
- Advanced analytics and full event booking are documented as future work if not fully implemented.

### Final System Testing

**User Story:**  
As the client, I want the system tested properly so that I can trust the website before handover.

**Acceptance Criteria:**

- Final test cases are created for customer, admin, checkout, wholesale, mobile, events, contact, reviews, and product workflows.
- Test results are recorded as pass/fail.
- Critical bugs are fixed or clearly documented.
- Testing screenshots or evidence are collected.

### Client Handover Guide

**User Story:**  
As the client, I want clear handover documentation so that I can understand, use, and continue the website after the project ends.

**Acceptance Criteria:**

- Handover guide includes live website link and repository link.
- Admin instructions are included.
- Known issues and outstanding work are documented.
- Future recommendations are included.
- Sprint 5 review feedback and handover evidence are recorded.
