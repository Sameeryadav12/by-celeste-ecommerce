# Shop and product pages (Step 5)

## What is now live

The website now displays real catalog data from the backend.

- The **Shop** page loads active products from the API.  
- Customers can filter by category, search by product name, and adjust sort order.  
- Product cards open real **Product Detail** pages using clean slug-based links.

## How real catalog data is connected

The frontend now calls backend catalog endpoints directly:

- `GET /api/products` for product listing and filters  
- `GET /api/products/:slug` for one product detail page  
- `GET /api/categories` for category filter options

A small mapping layer keeps frontend product types clean and stable, even if backend responses evolve. This includes consistent price parsing and image URL handling.

## What the Product Detail page includes

For each product, the page now shows:

- Core product details (name, image, price, summary)  
- Full description and how-to-use guidance  
- Ingredients and category tags  
- Stock status and featured indicator (when relevant)

## What comes next (later steps)

This step only covers browsing and product viewing.

Later steps will add:

- Cart actions and cart state  
- Checkout flow  
- Payment integration  
- Order-related customer experiences

For now, customers can confidently explore real product information in a clean, premium storefront layout.

