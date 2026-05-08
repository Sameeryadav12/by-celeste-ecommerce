# Products

## Purpose

This document explains—in plain English—what product information By Celeste stores, and how the website now uses that data in the Shop and Product Detail pages (Step 5).

**Client catalog override:** When `backend/data/client-products.md` is present, the seed script (`npm run seed:catalog`) uses that file instead of this document to populate the database—**as long as** the Markdown sections follow the same pattern (see product examples below). See `docs/19-client-assets-and-catalog.md` and `backend/data/README.md`.

## What product information is stored now

For each **product**, the system can store:

- **Name** — what appears on the shelf and in the cart.
- **Slug** — a short, URL-friendly name used in links (for example, for a product detail page).
- **Short description** — a brief marketing line for cards and listings.
- **Full description** — richer story and details for the product page.
- **How to use** — simple steps so customers know how to apply the product.
- **Price** — stored precisely (as a decimal number) to avoid rounding mistakes.
- **Compare-at price** (optional) — a “was” price when you want to show gentle value messaging.
- **Image URL** — a link to an image file or a path to an asset in the project.
- **Active / featured flags** — whether the product is visible in the shop and whether it should be highlighted.
- **Stock quantity** — how many units are available (a whole number, zero or more).
- **Timestamps** — when the record was created and last updated.

Sensitive or complex topics (tax rules, multi-currency, variants like sizes) can be added in future steps; this step focuses on a **solid, honest catalog core**.

## What categories are for

**Categories** are groups that help customers browse.

- They help customers **browse** without searching.
- For this step, the catalog uses **top-level categories only**:
  - Face Care
  - Body Care
  - Hands & Feet
  - Bath & Ritual
  - Gift Sets & Discovery Kits

Note: the database model still supports products living in multiple categories, but this seed setup assigns each product to one top-level category for a clean experience.

## What ingredients are for

**Ingredients** are entries in a shared library (name, description, optional benefits text).

- Products can list **many ingredients**, and the same ingredient can appear in **many products**.
- This supports **transparent, educational** product pages—especially important for skincare.

## Product Content (Real Data Now Used)

The seeded catalog is no longer placeholder text.

From `docs/04-products.md`, each seeded product now includes:

- `name` and `slug` (for product URLs)
- `shortDescription` (used on product cards and listings)
- `description` (full product story on the Product Detail page)
- `benefits` (“Key benefits”, shown as a list on the Product Detail page)
- `howToUse` (the instructions customers can follow)
- `price` (AUD)
- `stockQuantity` (set to a fixed demo value for consistent behaviour)
- `imageUrl` (a local image path used by the frontend)

This is the content the website displays on the Shop and Product Detail pages.

## Product Images (Local + Performance)

Product images are served locally from:

- `frontend/public/images/products/`

Each product uses a local URL in this format:

- `/images/products/<slug>.jpg` or `/images/products/<slug>.png`

To keep the UI looking polished:

- images are **lazy loaded**
- the frontend uses a **skeleton placeholder** while images load
- a **fallback image** is used if the source image is missing
- a **fixed square aspect ratio** + `object-cover` prevents layout shifting

## What the Shop page now shows

The Shop page now loads real products from the backend and presents them in a clean card grid.

- Product image
- Product name
- Short description
- Price (and compare-at price if available)
- Featured badge where relevant
- **Native / hero ingredient badges** (up to two on cards): small pills derived from linked ingredients and product name—for example Kakadu Plum, Desert Lime, Native botanical—so the range reads more **uniquely Australian** without crowding the grid.

The shop intro copy notes that formulas use **Australian botanicals** and that highlights on cards are subtle and formula-based.

Customers can also:

- Filter by category
- Search by product name
- Optionally focus on featured products
- Change sort order (name or price)

The page also handles loading states, empty results, and request errors in a customer-friendly way.

## What the Product Detail page now shows

Each product card opens a real product detail page using the product slug in the URL.

The page now shows:

- Product image and name
- Price and compare-at price (if set)
- Short summary
- **Up to three subtle ingredient badges** under the title (same logic as cards—native heroes where they match the catalog data)
- Full description
- How to use
- Ingredient list
- Category tags
- Stock status

If a slug is invalid or the product is not available, the page shows a clear not-found message instead of crashing.

## How categories and ingredients help customers

- **Categories** make browsing easier by grouping products into meaningful sections (for example, body care and face care).
- **Ingredients** help customers understand formulas and make confident skincare choices.

## Simple customer flow

1. Customer opens the **Shop** page.
2. Customer browses products and uses **filter/search** controls.
3. Customer opens a **Product Detail** page from a product card.
4. Customer reads ingredients and how-to-use guidance before deciding what to buy.

## Demo data

A **seed script** can load a small, skincare-themed sample catalog (categories, ingredients, and products) so developers and testers have realistic examples. See backend `package.json` script `seed:catalog` and team runbook for commands.

## Sample product marketing copy (for seeded catalog)

These examples show the kind of polished copy that appears on Product Detail pages. In the seed dataset, the backend stores this content so the frontend can display it consistently.

### By Celeste – Kakadu Plum Radiance Facial Oil

**Description:** Immerse your skin in the radiant purity of the Australian landscape with By Celeste Kakadu Plum Radiance Facial Oil. Crafted from precious botanicals and native fruit extracts, this nourishing oil enhances your natural glow while replenishing the skin’s moisture barrier. Lightweight and fast-absorbing, it delivers a dewy luminosity without feeling greasy. Each drop captures the essence of untouched Australian nature—Kakadu Plum, Jojoba, and Calendula—working in harmony to revive dull, tired skin. The result is a complexion that feels balanced, velvety, and beautifully luminous.
**Key benefits:**

- Instantly brightens and enhances natural radiance
- Deeply hydrates and rebalances the complexion
- Helps soften fine lines and improve skin texture
- Absorbs quickly for a non-greasy, luminous finish
- Supports skin resilience against daily environmental stressors
  **Key ingredients:**
- Kakadu Plum Extract – Rich in natural vitamin C, helps brighten and revitalize the skin.
- Jojoba Oil – Closely mimics the skin’s natural sebum, providing light, lasting moisture.
- Macadamia Seed Oil – Smooths and softens for a silky complexion.
- Calendula Flower Extract – Soothes and calms delicate or dry skin.
- Rosehip Oil – A botanical source of essential fatty acids to nourish and rejuvenate.
  **How to use:**
- Warm 2–3 drops between your palms.
- Gently press onto cleansed face, neck, and décolletage.
- Use morning and evening, alone or layered under your favourite moisturiser.
  **Price:** AUD $68 / 30mL

### By Celeste – Desert Lime Cream Cleanser

**Description:** Rediscover the purity of daily cleansing with By Celeste Desert Lime Cream Cleanser — an indulgent fusion of native botanicals and soothing emollients designed to cleanse without compromise. Inspired by the resilience of the Australian desert, Desert Lime and Quandong extracts revitalise and tone, while nourishing oils cushion the skin in a veil of hydration. The silky, non-foaming texture dissolves impurities and makeup effortlessly, leaving skin calm, soft, and refreshed.
**Key benefits:**

- Gently cleanses without stripping moisture
- Restores softness and comfort after cleansing
- Refreshes and tones with native citrus botanicals
- Calms delicate or sensitive skin types
- Prepares skin for optimal absorption of serums and moisturisers
  **Key ingredients:**
- Desert Lime Extract – Native to Australia; brightens and renews for a refreshed complexion.
- Quandong Extract – A gentle native fruit rich in natural antioxidants that revitalise tired skin.
- Macadamia Oil – Deeply nourishes to maintain balance and prevent dryness.
- Aloe Vera Leaf Juice – Cools and soothes, supporting moisture retention.
- Sweet Almond Oil – Leaves skin supple with a lightweight, silky feel.
  **How to use:**
- Apply a small amount to damp skin.
- Massage gently in circular motions over face and neck.
- Remove with warm water or a soft cleansing cloth.
- Follow with toner or facial oil for best results.
  **Price:** AUD $54 / 100 mL

### By Celeste – Wild Rosella Hydrating Face Mist

**Description:** Revitalise your complexion with the gentle freshness of By Celeste Wild Rosella Hydrating Face Mist. Inspired by the vivid blooms of northern Australia, this fine mist infuses skin with light, lasting hydration and a touch of botanical calm. Wild Rosella and native Quandong restore suppleness and luminosity, while Aloe Vera and Cucumber cool and soothe throughout the day.
**Key benefits:**

- Provides instant hydration and revitalisation
- Calms and balances tired or sensitive skin
- Enhances natural radiance and tone
- Refreshes makeup for a dewy finish
- Offers a soothing sensory experience throughout the day
  **Key ingredients:**
- Wild Rosella – Native to Australia; supports hydration and a vibrant complexion.
- Quandong Extract – Naturally brightens and softens dull skin.
- Aloe Vera Leaf Juice – Cools and replenishes moisture.
- Cucumber Extract – Provides immediate refreshment and comfort.
- Kangaroo Paw Extract – Helps maintain suppleness and smooth texture.
  **How to use:**
- Hold 20–30 cm from face.
- Close eyes and mist evenly over skin.
- Use after cleansing, before moisturiser, or throughout the day for hydration.
- Can be applied over makeup to refresh glow.
  **Price:** AUD $48 / 100 mL

### By Celeste – Banksia & Quandong Nourishing Day Cream

**Description:** Embrace the serenity of each morning with By Celeste Banksia & Quandong Nourishing Day Cream. This richly hydrating yet effortless formula envelops the skin in lasting comfort and a natural, healthy radiance. Infused with native Banksia and Quandong, it replenishes moisture and restores smoothness throughout the day.
**Key benefits:**

- Deeply nourishes and hydrates for all-day comfort
- Enhances natural luminosity and suppleness
- Absorbs quickly for a smooth, non-greasy finish
- Softens the appearance of dryness and fatigue
- Creates the ideal base for makeup or SPF application
  **Key ingredients:**
- Banksia Flower Extract – Gently revitalises and protects skin’s moisture balance.
- Quandong Extract – A native desert fruit rich in natural antioxidants.
- Macadamia Seed Oil – Nourishes with a soft, velvety touch.
- Jojoba Oil – Mimics natural skin oils for lightweight nourishment.
- Shea Butter – Adds luxurious smoothness and comfort.
  **How to use:**
- Apply a small amount each morning to cleansed face and neck.
- Gently massage in upward motions until absorbed.
- Follow with sunscreen or use as a priming base for makeup.
  **Price:** AUD $76 / 50 mL

### By Celeste – Tasmanian Sea Kelp Night Renewal Balm

**Description:** Indulge in the quiet luxury of restorative sleep with By Celeste Tasmanian Sea Kelp Night Renewal Balm. Inspired by the pristine southern coast, this velvety balm cocoons the skin in deep, replenishing hydration while you rest. Infused with Tasmanian Sea Kelp, Macadamia, and Finger Lime, it nourishes the complexion for a radiant morning glow.
**Key benefits:**

- Deeply replenishes and comforts during overnight repair
- Restores suppleness for a radiant morning glow
- Locks in moisture without greasiness
- Softens and smooths dry or mature skin
- Calms the senses with a soothing botanical aroma
  **Key ingredients:**
- Tasmanian Sea Kelp Extract – Marine-rich botanical from southern Australia.
- Finger Lime Extract – Refreshes and refines texture.
- Macadamia Oil – Provides deep nourishment while enhancing elasticity.
- Kangaroo Paw Extract – Promotes softness and hydration retention.
- Shea Butter – Offers rich, long-lasting comfort.
  **How to use:**
- Warm a pea-sized amount between fingertips.
- Gently press and smooth over face, neck, and décolletage after evening cleansing.
- Allow to absorb fully before sleep.
  **Price:** AUD $84 / 50 mL

### By Celeste – Lilly Pilly Brightening Enzyme Mask

**Description:** Reveal your most luminous complexion with By Celeste Lilly Pilly Brightening Enzyme Mask. Formulated with native Lilly Pilly and Davidson Plum, this creamy mask softly refines skin texture and restores a healthy, natural glow. Papaya enzymes delicately renew the surface, while Desert Lime and Aloe Vera deliver soothing hydration.
**Key benefits:**

- Gently resurfaces for a smoother, more radiant appearance
- Revives dull, tired skin without irritation
- Hydrates and balances for soft, supple texture
- Promotes an even, healthy-looking glow
- Creates a spa-quality experience at home
  **Key ingredients:**
- Lilly Pilly Extract – Native fruit rich in natural fruit acids.
- Davidson Plum – Helps improve radiance and skin clarity.
- Papaya Enzyme – Softly dissolves dull surface cells.
- Desert Lime Extract – Provides light hydration and a softly toned glow.
- Aloe Vera Leaf Juice – Calms and soothes, leaving skin refreshed.
  **How to use:**
- Apply a thin, even layer to cleansed face and neck.
- Leave for 5–10 minutes, avoiding the eye area.
- Gently remove with a warm cloth or rinse with water.
- Use 1–2 times weekly for renewed brightness.
  **Price:** AUD $72 / 60 mL

### By Celeste – Macadamia & Lemon Myrtle Body Wash

**Description:** Transform your daily cleanse into a moment of pure indulgence with By Celeste Macadamia & Lemon Myrtle Body Wash. This velvety, plant-based wash draws from Australia’s rainforests, blending nourishing Macadamia oil with the bright, native zing of Lemon Myrtle. The creamy lather gently removes impurities while enveloping the body in lightweight hydration and a refreshing citrus-herbal aroma.
**Key benefits:**

- Gently cleanses while preserving natural moisture
- Leaves skin soft, balanced, and lightly hydrated
- Infuses a fresh, uplifting native citrus scent
- Provides a spa-inspired sensory experience
- Balances and comforts without tightness or residue
  **Key ingredients:**
- Macadamia Seed Oil – Native Australian richness that nourishes and softens skin.
- Lemon Myrtle Extract – A vibrant native leaf offering refreshing aroma.
- Aloe Vera Leaf Juice – Calms and hydrates for everyday comfort.
- Eucalyptus Extract – Adds a clean, invigorating spa-like touch.
- Coconut-Derived Surfactants – Create a gentle, creamy lather.
  **How to use:**
- Dispense a small amount into wet hands or a soft sponge.
- Massage gently over body to create a light lather.
- Rinse with warm water and pat dry.
- Follow with By Celeste body lotion for lasting softness.
  **Price:** AUD $44 / 300 mL

### By Celeste – Wattleseed & Vanilla Exfoliating Body Polish

**Description:** Elevate your ritual of renewal with By Celeste Wattleseed & Vanilla Exfoliating Body Polish. This opulent scrub harnesses finely ground native Wattleseed to gently polish away the day’s dullness, revealing skin that’s irresistibly soft and radiant. Luxurious Macadamia and Shea Butter envelop the body in deep hydration, while warm Vanilla and Sandalwood whisper a calming spa-like finish.
**Key benefits:**

- Gently buffs away dullness for renewed smoothness
- Deeply hydrates while polishing, never stripping
- Leaves skin luminous, soft, and supple
- Infuses a warm, lingering native vanilla scent
- Prepares body beautifully for oils or lotions
  **Key ingredients:**
- Wattleseed Granules – Gently refine and nourish skin texture.
- Vanilla Bean Extract – Offers comforting warmth and subtle softening comfort.
- Macadamia Seed Oil – Rich hydration and silky protective feel.
- Shea Butter – Deep conditioning for lasting suppleness.
- Sweet Almond Oil – Enhances smoothness with lightweight nourishment.
  **How to use:**
- Scoop a generous amount onto damp skin.
- Massage in circular motions, focusing on elbows, knees, and legs.
- Rinse with warm water, patting gently dry.
- Follow with By Celeste body oil for enhanced softness.
  **Price:** AUD $56 / 200 mL

### By Celeste – Eucalyptus & Kunzea Muscle Recovery Body Oil

**Description:** Soothe and restore with By Celeste Eucalyptus & Kunzea Muscle Recovery Body Oil, a warming blend inspired by Australia’s ancient landscapes. Kunzea’s gentle notes harmonise with invigorating Eucalyptus to comfort tired muscles and replenish dry skin after activity. Lightweight Macadamia and Jojoba oils nourish without residue, leaving a subtle, earthy aroma that calms the senses.
**Key benefits:**

- Comforts and warms overworked muscles
- Deeply nourishes skin for lasting softness
- Absorbs quickly with no greasy feel
- Provides a grounding, spa-like aroma
- Restores balance after exercise or daily demands
  **Key ingredients:**
- Kunzea Essential Oil – Soothing native bush oil.
- Eucalyptus Oil – Refreshing sensory lift.
- Macadamia Seed Oil – Hydrates and smooths the skin.
- Jojoba Oil – Lightweight moisture that mimics skin oils.
- Sweet Almond Oil – Silky, gentle nourishment.
  **How to use:**
- Dispense 4–6 drops into palms after showering.
- Warm between hands and massage into muscles and body.
- Focus on shoulders, legs, and any tense areas.
- Use morning, evening, or post-exercise.
  **Price:** AUD $62 / 100 mL

### By Celeste – Alpine Lavender Calming Body Lotion

**Description:** Drift into calm with By Celeste Alpine Lavender Calming Body Lotion, a silken embrace drawn from Tasmania’s alpine meadows. Pure Alpine Lavender weaves its soothing magic through lightweight Macadamia and Jojoba oils, restoring hydration and leaving skin velvety soft. Native Kunzea adds grounding warmth for balanced, spa-like serenity.
**Key benefits:**

- Deeply hydrates with a lightweight, non-greasy finish
- Soothes and calms skin after sun or environmental stress
- Leaves a subtle, lingering alpine floral scent
- Restores softness and smoothness all day
- Creates an instant sense of spa-like tranquillity
  **Key ingredients:**
- Alpine Lavender Extract – Tasmanian highlands.
- Macadamia Seed Oil – Native nourishment that softens gently.
- Jojoba Oil – Balances moisture with a light feel.
- Kunzea Extract – Native bush botanical offering comforting warmth.
- Shea Butter – Lasting hydration and velvety comfort.
  **How to use:**
- Smooth generously over clean, slightly damp skin.
- Massage gently into body, focusing on dry areas.
- Reapply as desired throughout the day.
- Pair with By Celeste body wash for a complete ritual.
  **Price:** AUD $52 / 250 mL

### By Celeste – Grapefruit & Finger Lime Hand & Body Wash

**Description:** Begin and end your day with the uplifting purity of By Celeste Grapefruit & Finger Lime Hand & Body Wash. This silky, plant-based cleanser marries sun-ripened Grapefruit with native Finger Lime caviar beads for gentle cleansing that preserves natural moisture. Infused with Macadamia and Aloe for subtle nourishment, it leaves skin and hands refreshed, soft, and lightly scented.
**Key benefits:**

- Gently cleanses without drying hands or body
- Leaves skin soft, refreshed, and lightly hydrated
- Infuses bright, natural citrus aroma
- Provides spa-quality sensory refreshment
- Balances and comforts throughout the day
  **Key ingredients:**
- Finger Lime Extract – Native Australian caviar fruit for bright citrus vitality.
- Grapefruit Peel Oil – Uplifting aroma and gentle cleansing.
- Macadamia Seed Oil – Nourishment and soft hydration.
- Aloe Vera Leaf Juice – Soothes and calms for comfortable cleansing.
- Coconut-Derived Cleansers – Create creamy, gentle lather.
  **How to use:**
- Dispense into wet hands or soft sponge.
- Massage gently over hands, body, or face.
- Rinse with warm water, patting skin dry.
- Follow with By Celeste lotion for lasting softness.
  **Price:** AUD $46 / 300 mL

### By Celeste – Lemon Myrtle & Manuka Hand Cream

**Description:** Nourish your hands with the tender care of By Celeste Lemon Myrtle & Manuka Hand Cream. Native Lemon Myrtle brings a bright, refreshing citrus note, while precious Manuka and Macadamia deeply hydrate, restoring softness to hardworking hands. Shea Butter and Jojoba create a protective veil for smooth, supple comfort without greasiness.
**Key benefits:**

- Deeply hydrates dry, hardworking hands
- Leaves skin soft, smooth, and protected
- Absorbs quickly without greasy residue
- Infuses subtle, uplifting native citrus scent
- Provides lasting comfort throughout the day
  **Key ingredients:**
- Lemon Myrtle Extract – Bright, refreshing native leaf.
- Manuka Extract – Renowned for its soothing qualities.
- Macadamia Seed Oil – Rich hydration and silky softness.
- Shea Butter – Deep moisturising and protection.
- Jojoba Oil – Lightweight balance of moisture.
  **How to use:**
- Dispense a small amount into palms.
- Gently massage into hands, focusing on knuckles and cuticles.
- Reapply as needed throughout the day.
  **Price:** AUD $38 / 75 mL

### By Celeste – Macadamia & Wattleseed Repair Balm (Hands, Elbows & Heels)

**Description:** Rescue and restore with By Celeste Macadamia & Wattleseed Repair Balm, an intensely nourishing treatment for skin’s most demanding areas. Crafted from native Macadamia and finely milled Wattleseed, this rich balm melts into hands, elbows, and heels, delivering deep hydration and visible softness overnight. Shea Butter and Jojoba form a protective cocoon for comfortable repair.
**Key benefits:**

- Provides intensive repair for dry, cracked areas
- Deeply nourishes without stickiness
- Restores softness to hands, elbows, and heels
- Creates a protective barrier against dryness
- Leaves a subtle, grounding native earth aroma
  **Key ingredients:**
- Macadamia Seed Oil – Deep conditioning softness.
- Wattleseed Extract – Gentle nourishment and texture refinement.
- Shea Butter – Moisture-lock comfort.
- Jojoba Oil – Balanced, lightweight repair.
- Beeswax – Breathable hydration barrier.
  **How to use:**
- Scoop a small amount with clean fingertips.
- Warm between palms and apply generously to dry areas.
- Massage until absorbed, using morning or night.
- Wear cotton gloves or socks overnight for intensive treatment.
  **Price:** AUD $48 / 60 g

### By Celeste – Desert Sand Pumice Foot Scrub

**Description:** Rediscover the grace of soft, refined feet with By Celeste Desert Sand Pumice Foot Scrub. This indulgent treatment blends finely milled desert pumice with native Quandong and Macadamia oil, gently buffing away roughness while enveloping tired soles in deep hydration. Inspired by the smoothing winds of the outback, it leaves feet silky, renewed, and delicately scented with warm native botanicals.
**Key benefits:**

- Gently removes hard skin and calluses
- Deeply hydrates while smoothing roughness
- Leaves feet soft, supple, and revitalised
- Provides spa-like sensory refreshment
- Prepares feet beautifully for lotions or barefoot comfort
  **Key ingredients:**
- Desert Pumice – Finely milled Australian volcanic stone.
- Quandong Extract – Native fruit that nourishes and softens.
- Macadamia Seed Oil – Rich native hydration for silky smoothness.
- Shea Butter – Locks in moisture for lasting comfort.
- Lemon Myrtle Extract – Bright, uplifting native aroma.
  **How to use:**
- Soften feet in warm water for 5 minutes.
- Apply generously and massage in circular motions over soles and heels.
- Rinse thoroughly, patting dry.
- Follow with By Celeste foot cream or oil.
  **Price:** AUD $52 / 200 g

### By Celeste – Blue Gum & Epsom Mineral Bath Soak

**Description:** Unwind into deep tranquillity with By Celeste Blue Gum & Epsom Mineral Bath Soak. A mineral-rich ritual inspired by Tasmania’s eucalyptus forests, it transforms bath time into a spa sanctuary that eases the body and calms the mind. Native Kunzea and Macadamia extracts nourish the skin while native eucalyptus aroma invites restorative rest.
**Key benefits:**

- Creates instant spa-like relaxation for body and mind
- Softens and smooths skin during immersion
- Comforts after physical activity or daily stress
- Infuses invigorating native eucalyptus aroma
- Leaves skin refreshed and subtly nourished
  **Key ingredients:**
- Blue Gum (Eucalyptus) Leaf Oil – Native Tasmanian essence.
- Epsom Salts (Magnesium Sulfate) – Mineral-rich crystals that soothe.
- Kunzea Extract – Native Australian bush botanical.
- Macadamia Seed Oil – Gentle skin nourishment and hydration.
- Dried Eucalyptus Leaves – Adds natural texture and bushland aroma.
  **How to use:**
- Add 1–2 cups to running warm bath water.
- Stir gently to dissolve salts and disperse oils.
- Soak for 15–20 minutes, breathing deeply.
- Rinse briefly and pat skin dry.
  **Price:** AUD $42 / 400 g

### By Celeste – Wildflower Sleep Pillow & Linen Mist

**Description:** Drift into peaceful slumber with By Celeste Wildflower Sleep Pillow & Linen Mist. A delicate veil of native Australian botanicals crafted for evening serenity, it gently scents pillows, linens, and nightwear with soft floral whispers that soothe the senses. Lightweight and non-staining, it creates an instant spa-like retreat in your bedroom.
**Key benefits:**

- Creates instant calming bedroom ambiance
- Gently scents pillows and linens for better rest
- Promotes a spa-like sensory wind-down
- Lightweight formula, safe for fabrics
- Leaves subtle, lingering native floral aroma
  **Key ingredients:**
- Boronia Flower Extract – Delicate native floral comfort.
- Wattle Flower Essence – Gentle native bloom for grounding warmth.
- Tasmanian Lavender Oil – Calms and relaxes.
- Kangaroo Paw Extract – Adds subtle native softness.
- Witch Hazel Water – Lightweight non-staining mist base.
  **How to use:**
- Shake gently before use.
- Mist lightly over pillows, sheets, and pyjamas from 30cm away.
- Allow to settle for 1–2 minutes before contact.
- Use nightly or whenever needing calming refreshment.
  **Price:** AUD $36 / 100 mL

### By Celeste – Native Honey & Clay Purifying Face & Body Mask

**Description:** Purify and restore with By Celeste Native Honey & Clay Purifying Face & Body Mask. A creamy treatment harnessing Australian Jelly Bush Honey and mineral-rich Kaolin Clay that gently supports cleansing while enveloping skin in deep hydration and nourishment. Quandong and Macadamia balance the purifying clay for a refreshed, smooth, naturally luminous finish.
**Key benefits:**

- Gently draws out impurities while hydrating
- Leaves skin smooth, soft, and balanced
- Comforts without tightness or irritation
- Suitable for face and body use
- Creates an indulgent, spa-like treatment experience
  **Key ingredients:**
- Jelly Bush Honey – Native Australian honey with nourishing humectant qualities.
- Australian Kaolin Clay – Mineral-rich earth that absorbs excess oils.
- Quandong Extract – Softening, revitalising native fruit comfort.
- Macadamia Seed Oil – Lightweight hydration and silky texture.
- Aloe Vera Leaf Juice – Soothes and calms during purification.
  **How to use:**
- Apply thin layer to clean face or body.
- Leave on 8–12 minutes until set but not cracking.
- Remove with warm, damp cloth or rinse thoroughly.
- Use weekly or as needed for purification.
  **Price:** AUD $68 / 100 g

### By Celeste Native Essentials Discovery Trio

**Description:** By Celeste Native Essentials Discovery Trio offers an elegant introduction to Australia’s native botanical treasures through three travel-sized heroes: Kakadu Plum Radiance Facial Oil, Desert Lime Cream Cleanser, and Banksia & Quandong Nourishing Day Cream. A curated collection designed for gifting and discovery with a complete spa-like ritual in miniature.
**Key benefits:**

- Introduces three essential steps of the By Celeste ritual
- Travel-sized for portability and gifting convenience
- Showcases native Australian botanicals’ natural nourishment
- Creates a complete spa-like experience in miniature format
  **Key ingredients:** Kakadu Plum, Desert Lime, Banksia, Quandong, plus complementary oils in each hero formula.
  **How to use:**
- Morning: Cleanse with Desert Lime Cream Cleanser, apply Kakadu Plum Facial Oil (2 drops), then finish with Banksia & Quandong Day Cream.
- Evening: Repeat the ritual or layer as preferred.
  **Price:** AUD $65 (valued at $95)

### By Celeste – Australian Body Ritual Gift Box

**Description:** Indulge in Australia’s native serenity with the By Celeste Australian Body Ritual Gift Box — a luxurious quartet designed for complete body renewal. Featuring full-size Macadamia & Lemon Myrtle Body Wash (300mL), Wattleseed & Vanilla Exfoliating Body Polish (200mL), Alpine Lavender Calming Body Lotion (250mL), and Eucalyptus & Kunzea Muscle Recovery Body Oil (100mL). Each product harmonises native botanicals with spa-grade textures for a full cleanse, exfoliate, hydrate, and recover routine.
**Key benefits:**

- Complete 4-step body care ritual from cleanse to recovery
- Showcases Australia’s most cherished native botanicals
- Luxurious textures and spa-quality sensory experience
- Travel-friendly gift box with keepsake packaging
  **How to use (suggested routine):**
- Cleanse with Macadamia & Lemon Myrtle Body Wash.
- Exfoliate with Wattleseed & Vanilla Body Polish.
- Hydrate with Alpine Lavender Body Lotion.
- Finish with Eucalyptus & Kunzea Body Oil on tense areas.
  **Price:** AUD $148 (4 full-size products, valued at $194)

### By Celeste – Market Day Hand & Body Duo

**Description:** Capture the essence of sunlit market mornings with By Celeste Market Day Hand & Body Duo — a cheerful pairing of Grapefruit & Finger Lime Hand & Body Wash (300mL) and Lemon Myrtle & Manuka Hand Cream (75mL). Native citrus brightness and soothing bush honey create gentle cleansing and deep hydration for soft, radiant hands and comfort all day.
**Key benefits:**

- Bright, refreshing cleanse paired with deep hydration
- Native citrus scent evokes fresh market vibrancy
- Non-greasy formulas for all-day comfort
- Travel-friendly duo for home, work, or on-the-go
- Gift-ready packaging celebrates Australian simplicity
  **How to use:**
- Cleanse with Grapefruit & Finger Lime Wash.
- Apply Lemon Myrtle & Manuka Cream to hands as needed (morning for freshness, evening for recovery).
  **Price:** AUD $72 (valued at $84)

## Admin dashboard note (Step 11)

You can now manage the catalog directly through the **Admin dashboard**:

- Add new products
- Edit product details (including stock, active/featured toggles, and optional wholesale pricing)
- Assign products to categories and ingredients
