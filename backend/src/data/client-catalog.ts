/**
 * Client catalog entries — add products here, then run: npm run seed:client-catalog
 */
export type ClientCatalogProduct = {
  slug: string
  name: string
  priceAud: number
  /** Omit until client defines a category (product still appears in shop). */
  categorySlug?: string
  categoryName?: string
  imagePath: string
  shortDescription: string
  description: string
  howToUse: string
  benefits: string[]
  madeWith: string[]
  stockQuantity?: number
  isFeatured?: boolean
  /** High values sort to the end of the shop (default 0). */
  shopSortOrder?: number
}

export const CLIENT_CATALOG_PRODUCTS: ClientCatalogProduct[] = [
  {
    slug: 'green-tea-facial-moisturizer',
    name: 'Green Tea Facial Moisturizer 60g',
    priceAud: 35,
    categorySlug: 'face',
    categoryName: 'Face',
    imagePath: '/images/products/green-tea-facial-moisturizer.png',
    shortDescription:
      'A soft delicate fragrance highlights this exquisite velvety smooth moisturiser. Nourishes and protects your skin throughout the day.',
    description: `A soft delicate fragrance highlights this exquisite velvety smooth moisturiser. Nourishes and protects your skin throughout the day. A great base for your makeup.

Suitable for all skin types.`,
    howToUse:
      'Apply a small amount to cleansed face and neck morning and evening. Smooth gently until absorbed.',
    benefits: [
      'Velvety, non-greasy daily hydration',
      'Nourishes and protects throughout the day',
      'Works well as a makeup base',
      'Suitable for all skin types',
    ],
    madeWith: [
      'Aqua',
      'Macadamia Oil',
      'Shea & Cocoa Butters',
      'Plant Waxes',
      'Vitamin E & A',
      'Green Tea Extract',
      'Roman Chamomile',
      'Herbal Preservative',
      'Pure Essential Oils',
    ],
    stockQuantity: 50,
    isFeatured: true,
  },
  {
    slug: 'green-tea-facial-cleanser',
    name: 'Green Tea Facial Cleanser 100ml',
    priceAud: 30,
    categorySlug: 'face',
    categoryName: 'Face',
    imagePath: '/images/products/green-tea-facial-cleanser.png',
    shortDescription:
      'Our beautiful facial cleanser gently removes makeup, grime and dirt, leaving your skin thoroughly and deeply cleansed without dryness.',
    description: `Our beautiful facial cleanser gently removes makeup, grime and dirt, leaving your skin thoroughly and deeply cleansed without dryness.

Suitable for all skin types.`,
    howToUse:
      'Massage a small amount onto damp face and neck. Rinse thoroughly with warm water. Use morning and evening.',
    benefits: [
      'Gently removes makeup, grime and dirt',
      'Deep cleanse without dryness',
      'Suitable for all skin types',
    ],
    madeWith: [
      'Aqua',
      'Macadamia Oil',
      'Plant Waxes',
      'Vitamin E',
      'Green Tea Extract & Roman Chamomile',
      'Pure Essential Oils',
      'Herbal Preservative',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'christmas-star-string',
    name: 'Christmas Star String',
    priceAud: 8,
    imagePath: '/images/products/christmas-star-string.png',
    shortDescription: '5 x various Christmas Soap Stars hanging on a string.',
    description: '5 x various Christmas Soap Stars hanging on a string.',
    howToUse: 'Hang to display or gift. Use each star soap as a single wash.',
    benefits: ['Five assorted Christmas soap stars', 'Ready to hang on string'],
    madeWith: [],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'moroccan-spice-body-silk',
    name: 'Moroccan Spice Body Silk 175mL',
    priceAud: 35,
    categorySlug: 'body',
    categoryName: 'Body',
    imagePath: '/images/products/moroccan-spice-body-silk.png',
    shortDescription:
      'Pamper your whole body with our gorgeous Moroccan Spice Body Silk. This nourishing cream is readily absorbed, leaving skin deliciously soft and velvety smooth.',
    description: `Pamper your whole body with our gorgeous Moroccan Spice Body Silk. This nourishing cream is readily absorbed into the skin leaving it feeling deliciously soft and velvety smooth.`,
    howToUse: 'Massage into skin on the body after bathing or whenever skin needs nourishment.',
    benefits: [
      'Readily absorbed, non-greasy feel',
      'Leaves skin silky soft and velvety smooth',
      'Exotic Moroccan Spice fragrance',
    ],
    madeWith: [
      'Aqua',
      'Macadamia Nut Oil',
      'Shea & Cocoa Butters',
      'Plant Waxes',
      'Bees Wax',
      'Vitamin E',
      'Patchouli',
      'Vanilla',
      'Rose Absolute',
      'Cinnamon Bark',
      'Essential Oils & Herbal Preservatives',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'rose-floral-toner',
    name: 'Rose Floral Toner 100mL',
    priceAud: 15,
    categorySlug: 'face',
    categoryName: 'Face',
    imagePath: '/images/products/rose-floral-toner.png',
    shortDescription:
      'Light floral organic hydrosol to soothe and refresh your skin after cleansing, providing a moist base for your moisturiser.',
    description: `Light floral organic hydrosol to soothe and refresh your skin after cleansing, providing a moist base for your moisturiser. Totally pure and free of artificial additives.

Suitable for all skin types.`,
    howToUse:
      'After cleansing, apply to cotton pad and sweep over face and neck, or mist lightly. Follow with moisturiser.',
    benefits: [
      'Soothes and refreshes after cleansing',
      'Provides a moist base for moisturiser',
      'Pure — no artificial additives',
      'Suitable for all skin types',
    ],
    madeWith: ['Organic Rose', 'Pure Essential Oils'],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'cotton-soap-bag',
    name: 'Cotton Soap Bag',
    priceAud: 10,
    categorySlug: 'other',
    categoryName: 'Other',
    imagePath: '/images/products/cotton-soap-bag.png',
    shortDescription:
      'Cotton soap bag for soap ends or pieces. Keeps soap dry when not in use. Exfoliating on the skin.',
    description: `Cotton Soap Bag to place soap ends or pieces in. Keeps soap dry when not in use.

Exfoliating on the skin.`,
    howToUse:
      'Place soap ends or a bar inside the bag. Use in the shower to lather and gently exfoliate. Rinse and hang to dry.',
    benefits: [
      'Holds soap ends or pieces',
      'Helps soap stay dry between uses',
      'Gentle exfoliating texture on skin',
    ],
    madeWith: [],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'heart-soap',
    name: 'Heart Soap',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/heart-soap.png',
    shortDescription:
      'Heart Soap available in pink rose, lavender, lime or Moroccan spice varieties.',
    description:
      'Heart Soap available in pink rose, lavender, lime or Moroccan spice varieties.',
    howToUse: 'Wet soap and work into a lather on hands or body. Rinse well after use.',
    benefits: [
      'Available in pink rose, lavender, lime or Moroccan spice',
      'Handmade heart shape',
    ],
    madeWith: [],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'wooden-soap-rack',
    name: 'Wooden Soap Rack',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/wooden-soap-rack.png',
    shortDescription:
      'Hand made with Australian Beech wood and designed to keep your soap dry and out of water.',
    description:
      'Hand made with Australian Beech wood and designed to keep your soap dry and out of water.',
    howToUse: 'Place your soap bar on the rack between uses so air can circulate and water drains away.',
    benefits: [
      'Handmade Australian Beech wood',
      'Keeps soap dry and out of standing water',
      'Extends the life of your soap bar',
    ],
    madeWith: [],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: '4-for-ten',
    name: '4 For Ten',
    shopSortOrder: 9002,
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/4-for-ten.png',
    shortDescription: '4 pieces of soap for $10. Most varieties available. Approx. 120g total.',
    description: `4 Pieces of Soap for $10

Most varieties available

Approx. 120g total`,
    howToUse: 'Use each soap bar as a single wash. Store unused bars in a dry place.',
    benefits: ['Four soap pieces in one bundle', 'Most varieties available', 'Approx. 120g total'],
    madeWith: [],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'musk-stick-body-silk',
    name: 'Musk Stick Body Silk 175mL',
    priceAud: 35,
    categorySlug: 'body',
    categoryName: 'Body',
    imagePath: '/images/products/musk-stick-body-silk.png',
    shortDescription:
      'Pamper your whole body with our gorgeous Musk Stick Body Silk. This nourishing cream is readily absorbed, leaving skin deliciously soft and velvety smooth.',
    description: `Pamper your whole body with our gorgeous Musk Stick Body Silk. This nourishing cream is readily absorbed into the skin leaving it feeling deliciously soft and velvety smooth.`,
    howToUse: 'Massage into skin on the body after bathing or whenever skin needs nourishment.',
    benefits: [
      'Creamy musk stick body silk',
      'Readily absorbed, velvety smooth finish',
      'Leaves skin feeling deliciously soft',
    ],
    madeWith: [
      'Aqua',
      'Macadamia Nut Oil',
      'Shea & Cocoa Butters',
      'Plant Waxes',
      'Bees Wax',
      'Vitamin E',
      'Musk',
      'Essential Oils & Herbal Preservatives',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'moroccan-mint-foot-butter',
    name: 'Moroccan Mint Foot Butter 120mL',
    priceAud: 30,
    categorySlug: 'foot',
    categoryName: 'Foot',
    imagePath: '/images/products/moroccan-mint-foot-butter.png',
    shortDescription:
      'Rich and refreshing moisturizer to leave your feet feeling deeply nourished and velvety smooth.',
    description:
      'Rich and refreshing moisturizer to leave your feet feeling deeply nourished and velvety smooth.',
    howToUse:
      'Massage into clean, dry feet morning and evening. Pay extra attention to heels and dry areas.',
    benefits: [
      'Deeply nourishes feet',
      'Refreshing Moroccan mint feel',
      'Leaves skin velvety smooth',
    ],
    madeWith: [
      'Aqua',
      'Macadamia Oil',
      'Cocoa & Shea Butters',
      'Plant Waxes',
      'Beeswax',
      'Vitamin E',
      'Peppermint, Spearmint & Tea Tree Oils',
      'Natural Preservative',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'sandalwood-black-clay-sapone',
    name: 'Sandalwood Black Clay Sapone 100g',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/sandalwood-black-clay-sapone.png',
    shortDescription:
      'Moroccan influence. Suitable for all skin types. Sandalwood and black clay cleansing sapone.',
    description: `Moroccan Influence

Suitable for all skin types.`,
    howToUse: 'Wet soap and work into a lather on hands or body. Rinse well after use.',
    benefits: [
      'Moroccan-influenced formula',
      'Australian black clay cleansing',
      'Suitable for all skin types',
    ],
    madeWith: [
      'Olive, Coconut & Vegetable Oils',
      'Rice Bran, Avocado & Castor Oils',
      'Shea Butter',
      'Australian Black Clay',
      'Dead Sea Mineral Mud',
      'Vanilla',
      'Sandalwood',
      'Jasmine & Cinnamon Bark',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'spicy-love-perfume-balm',
    name: 'Spicy Love Perfume Balm 15g',
    priceAud: 20,
    categorySlug: 'perfume',
    categoryName: 'Perfume',
    imagePath: '/images/products/spicy-love-perfume-balm.png',
    shortDescription: 'Spicy Love perfume balm.',
    description: 'Spicy Love perfume balm.',
    howToUse: 'Apply a small amount to pulse points as desired.',
    benefits: ['Solid perfume balm format', 'Spicy Love fragrance'],
    madeWith: [],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'italian-lavender-bath-clay',
    name: 'Italian Lavender Bath Clay 320mL',
    priceAud: 20,
    categorySlug: 'bath',
    categoryName: 'Bath',
    imagePath: '/images/products/italian-lavender-bath-clay.png',
    shortDescription:
      'Luxurious milk bath — add ½ a cup to your bath and soak. Detoxifying, soothing, moisturising and rejuvenating.',
    description: `Indulge yourself with this luxurious milk bath
Add ½ a cup to your bath and soak.
Skin detoxifying, soothing, moisturising & rejuvenating`,
    howToUse: 'Add ½ a cup to warm running bath water. Soak and relax. Rinse tub after use if desired.',
    benefits: [
      'Luxurious milk bath experience',
      'Detoxifying and soothing',
      'Moisturising and rejuvenating',
    ],
    madeWith: [
      'Sea salt',
      'Epson Salt',
      'Australian Kaolin White Clay',
      'Bicarbonate Soda',
      'Coconut Milk Powder',
      'Lavender Buds',
      'Lavender Essential Oil',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'mandarin-lavender-hand-cream',
    name: 'Mandarin & Lavender Hand Cream 120mL',
    priceAud: 30,
    categorySlug: 'hand',
    categoryName: 'Hand',
    imagePath: '/images/products/mandarin-lavender-hand-cream.png',
    shortDescription:
      'Treat your hands with our luxurious balm rich in nourishing oils to heal and protect your skin, leaving it nourished and velvety smooth.',
    description:
      'Treat your hands with our luxurious balm rich in nourishing oils to heal and protect your skin leaving it nourished and velvety smooth',
    howToUse: 'Massage into hands as often as needed, especially after washing.',
    benefits: [
      'Rich in nourishing oils',
      'Helps heal and protect skin',
      'Leaves hands velvety smooth',
    ],
    madeWith: [
      'Aqua',
      'Macadamia Oil',
      'Plant Waxes',
      'Mango & Cocoa Butters',
      'Vitamin E',
      'Calendula Infused Oil',
      'Comfrey Extract',
      'Mandarin & Lavender',
      'Herbal Preservative',
      'Pure Essential Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'small-gift-crate-4-soap',
    name: 'Small Gift Crate with 4 pieces of Soap',
    priceAud: 55,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/small-gift-crate-4-soap.png',
    shortDescription: 'Small Gift Crate with 4 pieces of Soap.',
    description: 'Small Gift Crate with 4 pieces of Soap.',
    howToUse: 'Gift as-is or use each soap bar individually. Store in a dry place.',
    benefits: ['Wooden gift crate', 'Four assorted soap pieces', 'Ready to gift'],
    madeWith: [],
    stockQuantity: 50,
    isFeatured: true,
  },
  {
    slug: '100g-cake-soap',
    name: '100g Cake Soap',
    shopSortOrder: 9001,
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/placeholder.svg',
    shortDescription: '100g Cake Soap.',
    description: '100g Cake Soap.',
    howToUse: 'Wet soap and work into a lather. Rinse well after use.',
    benefits: ['Handmade cake soap', '100g size'],
    madeWith: [],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'green-tea-facial-sapone',
    name: 'Green Tea Facial Sapone 100g',
    priceAud: 10,
    categorySlug: 'face',
    categoryName: 'Face',
    imagePath: '/images/products/green-tea-facial-sapone.png',
    shortDescription: 'Extra 10% nourishing oils. Suitable for oily skin.',
    description: `Extra 10% Nourishing Oils

Suitable for Oily Skin`,
    howToUse: 'Wet soap and work into a lather on face. Rinse well. Avoid contact with eyes.',
    benefits: [
      'Extra 10% nourishing oils',
      'Formulated for oily skin',
      'Green tea facial cleansing sapone',
    ],
    madeWith: [
      'Olive, Coconut & Vegetable Oils',
      'Shea & Cocoa Butters',
      'Green Tea Leaves',
      'Green Tea leaf Extract',
      'Jojoba Oil',
      'Roman Chamomile',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'musk-body-cream',
    name: 'Musk Body Cream 120mL',
    priceAud: 35,
    categorySlug: 'body',
    categoryName: 'Body',
    imagePath: '/images/products/musk-body-cream.png',
    shortDescription:
      'Luxuriously rich double cream with a non-greasy finish. Leaves skin well hydrated, silky soft and supple.',
    description:
      'This double cream is luxuriously rich but with a non-greasy finish. Leaves your skin well hydrated and silky soft and supple',
    howToUse: 'Massage into skin on the body after bathing or whenever skin needs nourishment.',
    benefits: [
      'Rich yet non-greasy finish',
      'Deep hydration',
      'Leaves skin silky soft and supple',
    ],
    madeWith: [
      'Aqua',
      'Honey',
      'Glycerin',
      'Plant waxes',
      'Almond Oil',
      'Cocoa & Shea Butters',
      'Vitamin E',
      'Musk Oil',
      'Patchouli',
      'Rose Absolute Essential Oils',
      'Natural Preservatives',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'mint-tea-foot-scrub',
    name: 'Mint Tea Foot Scrub 120mL',
    priceAud: 30,
    categorySlug: 'foot',
    categoryName: 'Foot',
    imagePath: '/images/products/mint-tea-foot-scrub.png',
    shortDescription:
      'Detoxify and exfoliate your feet with this refreshing scrub. Removes dead and rough skin for wonderfully smooth feet.',
    description:
      'Detoxify and exfoliate your feet with this refreshing scrub. Removes dead and rough skin and leaves your feet feeling wonderfully smooth.',
    howToUse:
      'Apply to damp feet and massage in circular motions. Rinse thoroughly. Use 1–2 times per week.',
    benefits: [
      'Detoxifies and exfoliates',
      'Removes dead and rough skin',
      'Refreshing mint tea feel',
    ],
    madeWith: [
      'Aqua',
      'Macadamia Oil',
      'Plant Wax',
      'Australian White Clay',
      'Ground Pumice',
      'Peppermint, Spearmint & Tea Tree',
      'Natural Preservative',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'skin-soft-body-butter',
    name: 'Skin Soft Body Butter',
    priceAud: 20,
    categorySlug: 'body',
    categoryName: 'Body',
    imagePath: '/images/products/skin-soft-body-butter.png',
    shortDescription:
      'Rich body butter with cocoa, shea, nourishing oils and pure essential oils. Delivery only — cannot be posted.',
    description: `Rich solid body butter for silky, soft skin.

Note: Cannot be posted due to the fact that it is a butter. Please only order if delivery is an option.`,
    howToUse: 'Warm between palms and massage into skin on the body after bathing.',
    benefits: [
      'Cocoa and shea butter nourishment',
      'Macadamia and almond oils',
      'Solid butter format for intensive moisture',
    ],
    madeWith: [
      'Exotic Cocoa & Shea Butters',
      'Nourishing Almond, Macadamia Nut Oils',
      'Beeswax',
      'Kaolin White Clay',
      'Vitamin E',
      'Jasmine Absolute',
      'Organic Roman Chamomile & Organic Lavender',
      'Sandalwood',
      'Ginger',
      'Pure Essential Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'entice-massage-oil',
    name: 'Entice Massage Oil',
    priceAud: 20,
    categorySlug: 'body',
    categoryName: 'Body',
    imagePath: '/images/products/entice-massage-oil.png',
    shortDescription:
      'Rich in vitamins and highly nourishing. Soothes and protects the skin — a gentle blend for any massage application.',
    description: `Rich in vitamins and highly nourishing.

Especially designed to soothe and protect the skin.

A gentle blend for any type of massage application.`,
    howToUse: 'Warm a small amount in your palms and massage into skin using smooth, even strokes.',
    benefits: [
      'Vitamin-rich and highly nourishing',
      'Soothes and protects the skin',
      'Gentle blend for any massage application',
    ],
    madeWith: [
      'Macadamia Nut, Jojoba',
      'Calendula Infused & Rosehip Oils',
      'Vitamin E',
      'Rosemary Extract',
      'Patchouli',
      'Frangipani',
      'Sandalwood',
      'Cinnamon Bark',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'enriching-eye-cream',
    name: 'Enriching Eye Cream 15 mL',
    priceAud: 30,
    imagePath: '/images/products/enriching-eye-cream.png',
    shortDescription:
      'Enriching and nourishing butters and oils especially formulated for the eye area. Suitable for all skin types.',
    description: `Contains enriching and nourishing butters & oils especially formulated for the eye area.

Suitable for all skin types.`,
    howToUse:
      'Using your ring finger, gently pat a small amount around the eye area morning and night. Avoid direct contact with eyes.',
    benefits: [
      'Formulated for the delicate eye area',
      'Enriching butters and nourishing oils',
      'Suitable for all skin types',
    ],
    madeWith: [
      'Aqua',
      'Macadamia & Apricot Oil',
      'Shea & Cocoa Butters',
      'Plant Waxes',
      'Vitamin E & A',
      'Jojoba',
      'Calendula',
      'Green Tea Extract',
      'Herbal Preservative',
      'Pure Essential Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'moroccan-spice-sapone',
    name: 'Moroccan Spice Sapone 100g',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/moroccan-spice-sapone.png',
    shortDescription:
      'Aromatic and spicy luxury sapone. Suitable for all skin types.',
    description: `Aromatic & Spicy luxury

Suitable for all skin types.`,
    howToUse: 'Wet soap and work into a lather on hands or body. Rinse well after use.',
    benefits: [
      'Aromatic and spicy luxury',
      'Sapone clay cleansing',
      'Suitable for all skin types',
    ],
    madeWith: [
      'Olive, Coconut & Vegetable Oils',
      'Shea Butter',
      'Almond Meal',
      'Honey',
      'Ground Cinnamon',
      'Patchouli',
      'Cinnamon Bark',
      'Vanilla',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'mint-cocoa-sapone',
    name: 'Mint & Cocoa Sapone 100g',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/mint-cocoa-sapone.png',
    shortDescription:
      'For chocolate lovers. Mint and cocoa sapone suitable for all skin types.',
    description: `For Chocolate Lovers

Suitable for all skin types.`,
    howToUse: 'Wet soap and work into a lather on hands or body. Rinse well after use.',
    benefits: [
      'Mint and cocoa blend',
      'For chocolate lovers',
      'Suitable for all skin types',
    ],
    madeWith: [
      'Olive, Coconut & Vegetable Oils',
      'Shea & Cocoa Butters',
      'Cocoa Powder',
      'Peppermint & Spearmint',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'goats-milk-sapone',
    name: 'Goats Milk Sapone 100g',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/goats-milk-sapone.png',
    shortDescription:
      'Mild and gentle goats milk sapone. Suitable for sensitive skin.',
    description: `Mild & Gentle

Suitable for sensitive skin.`,
    howToUse: 'Wet soap and work into a lather on hands or body. Rinse well after use.',
    benefits: [
      'Mild and gentle formula',
      'Fresh goats milk',
      'Suitable for sensitive skin',
    ],
    madeWith: [
      'Olive, Coconut & Vegetable Oils',
      'Shea Butter',
      'Fresh Goats Milk',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'fig-almond-sapone',
    name: 'Fig & Almond Sapone 100g',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/fig-almond-sapone.png',
    shortDescription:
      'Sweet and luxurious fig and almond sapone. Suitable for all skin types.',
    description: `Sweet & Luxurious

Suitable for all skin types.`,
    howToUse: 'Wet soap and work into a lather on hands or body. Rinse well after use.',
    benefits: [
      'Sweet and luxurious blend',
      'Fig and almond nourishment',
      'Suitable for all skin types',
    ],
    madeWith: [
      'Olive, Coconut & Vegetable Oils',
      'Almond & Rice Bran Oils',
      'Shea Butter',
      'Dried Figs',
      'Mandarin',
      'Palma Rosa',
      'Ylang Ylang',
      'Rose Damask',
      'Lemon Myrtle',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'pomegranate-butter-sapone',
    name: 'Pomegranate Butter Sapone 100g',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/pomegranate-butter-sapone.png',
    shortDescription:
      'French refinedness. Pomegranate butter sapone suitable for dry skin.',
    description: `French Refinedness

Suitable for Dry Skin.`,
    howToUse: 'Wet soap and work into a lather on hands or body. Rinse well after use.',
    benefits: [
      'French refinedness',
      'Pomegranate and pink clay',
      'Suitable for dry skin',
    ],
    madeWith: [
      'Coconut Oil',
      'Shea & Cocoa Butters',
      'Australian Pink Clay',
      'Pomegranate Extract',
      'Rosella Flower',
      'Lavender',
      'Sandalwood',
      'Cedarwood',
      'Vanilla & Cinnamon Bark',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'roasted-wattle-seed-sapone-scrub',
    name: 'Roasted Wattle Seed Sapone Scrub 100g',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/roasted-wattle-seed-sapone-scrub.png',
    shortDescription:
      'Moroccan influence. Roasted wattle seed sapone scrub suitable for all skin types.',
    description: `Moroccan Influence

Suitable for all skin types.`,
    howToUse: 'Wet soap and work into a lather on hands or body. Rinse well after use.',
    benefits: [
      'Moroccan-influenced formula',
      'Exfoliating wattle seed and almond meal',
      'Suitable for all skin types',
    ],
    madeWith: [
      'Olive, Coconut & Vegetable Oils',
      'Shea & Cocoa Butters',
      'Australian Yellow and Red Clay',
      'Ground Turmeric',
      'Roasted Wattle Seed & Almond Meal',
      'Patchouli',
      'Vanilla Rose',
      'Cinnamon Bark',
      'Orange',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'moroccan-spice-body-cream',
    name: 'Moroccan Spice Body Cream 120mL',
    priceAud: 35,
    categorySlug: 'body',
    categoryName: 'Body',
    imagePath: '/images/products/moroccan-spice-body-cream.png',
    shortDescription:
      'Luxuriously rich double cream with a non-greasy finish. Leaves skin well hydrated, silky soft and supple.',
    description:
      'This double cream is luxuriously rich but with a non-greasy finish. Leaves your skin well hydrated and silky soft and supple.',
    howToUse: 'Massage into skin on the body after bathing or whenever skin needs nourishment.',
    benefits: [
      'Rich yet non-greasy finish',
      'Deep hydration',
      'Exotic Moroccan Spice fragrance',
    ],
    madeWith: [
      'Aqua',
      'Glycerine',
      'Honey',
      'Almond and Coconut Oils',
      'Cocoa & Shea Butters',
      'Vitamin E',
      'Vanilla',
      'Patchouli',
      'Rose Absolute',
      'Cinnamon Bark',
      'Essential Oils',
      'Natural Preservatives',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'christmas-spice-diffuser-oil',
    name: 'Christmas Spice Diffuser Oil 10mL',
    priceAud: 15,
    categorySlug: 'other',
    categoryName: 'Other',
    imagePath: '/images/products/christmas-spice-diffuser-oil.png',
    shortDescription:
      'Keep the Christmas spirit alive with this spicy festive aroma.',
    description: 'Keep the Christmas spirit alive with this spicy festive aroma.',
    howToUse: `Massage — 5–10 drops in massage oil.

Bath — 12–20 drops in a full drawn bath.

Vaporiser — 8–10 drops in bowl.`,
    benefits: [
      'Spicy festive Christmas aroma',
      'Versatile for massage, bath or vaporiser',
      'Pure essential oil blend',
    ],
    madeWith: [
      'Vanilla Oleoresin',
      'Mandarin',
      'Tangerine',
      'Cinnamon Bark',
      'Clove Bud',
      'Ginger Essential Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'lemon-rose-hand-cream',
    name: 'Lemon & Rose Hand Cream 120mL',
    priceAud: 30,
    categorySlug: 'hand',
    categoryName: 'Hand',
    imagePath: '/images/products/lemon-rose-hand-cream.png',
    shortDescription:
      'Treat your hands with our luxurious balm rich in nourishing oils to heal and protect your skin, leaving it nourished and velvety smooth.',
    description:
      'Treat your hands with our luxurious balm rich in nourishing oils to heal and protect your skin leaving it nourished and velvety smooth.',
    howToUse: 'Massage into hands as often as needed, especially after washing.',
    benefits: [
      'Rich in nourishing oils',
      'Helps heal and protect skin',
      'Lemon and rose fragrance',
    ],
    madeWith: [
      'Aqua',
      'Macadamia Oil',
      'Plant Waxes',
      'Mango & Cocoa Butters',
      'Vitamin E',
      'Calendula Infused Oil',
      'Lemon & Rose Absolute',
      'Rosewood',
      'Herbal Preservative',
      'Pure Essential Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'lemoncello-body-butter',
    name: 'Lemoncello Body Butter 175mL',
    priceAud: 35,
    categorySlug: 'body',
    categoryName: 'Body',
    imagePath: '/images/products/lemoncello-body-butter.png',
    shortDescription:
      'Pamper your whole body with our gorgeous Lemoncello body butter. Readily absorbed, leaving skin deliciously soft and velvety smooth.',
    description: `Pamper your whole body with our gorgeous Lemoncello Body Butter. This nourishing cream is readily absorbed into the skin leaving it feeling deliciously soft and velvety smooth.`,
    howToUse: 'Massage into skin on the body after bathing or whenever skin needs nourishment.',
    benefits: [
      'Readily absorbed nourishment',
      'Leaves skin deliciously soft and velvety smooth',
      'Gorgeous fruity Lemoncello aroma',
    ],
    madeWith: [
      'Aqua',
      'Macadamia Nut Oil',
      'Shea & Cocoa Butters',
      'Plant Waxes',
      'Bees Wax',
      'Vitamin E',
      'Lime',
      'Lavender',
      'Mandarin',
      'Marjoram Sweet Essential Oils',
      'Herbal Preservatives',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'soap-stack',
    name: 'Soap Stack',
    priceAud: 50,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/soap-stack.png',
    shortDescription:
      'Soap Stack — 4 popular pieces of soap on a timber soap rack.',
    description: 'Soap Stack — 4 popular pieces of soap on a timber soap rack.',
    howToUse: 'Gift as-is or use each soap bar individually. Keep on the rack between uses so soap stays dry.',
    benefits: [
      'Four popular soap pieces',
      'Timber soap rack included',
      'Ready to gift',
    ],
    madeWith: [],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'large-gift-crate-6-soap',
    name: 'Large Gift Crate with 6 pieces of Soap',
    priceAud: 75,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/large-gift-crate-6-soap.png',
    shortDescription:
      'Large gift crate with 6 pieces of the most popular soap.',
    description: 'Large Gift Crate with 6 pieces of the most popular Soap.',
    howToUse: 'Gift as-is or use each soap bar individually. Store in a dry place.',
    benefits: [
      'Wooden gift crate',
      'Six popular soap pieces',
      'Ready to gift',
    ],
    madeWith: [],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'large-gift-crate-unfilled',
    name: 'Large Gift Crate — Unfilled',
    priceAud: 15,
    categorySlug: 'other',
    categoryName: 'Other',
    imagePath: '/images/products/large-gift-crate-unfilled.png',
    shortDescription:
      'Empty large gift crate. Holds 1–6 soap pieces or a cream; removable bottom becomes a soap rack. 70mm × 140mm.',
    description: `Large Gift Crate — place 1–6 pieces of soap or a cream for the perfect gift.

Bottom lifts out to become a soap rack.

70mm × 140mm.`,
    howToUse:
      'Add your choice of soap or cream inside the crate. Gift as-is. Remove the bottom insert to use as a soap rack between uses.',
    benefits: [
      'Fits 1–6 soap pieces or a cream jar',
      'Removable bottom doubles as a soap rack',
      '70mm × 140mm wooden crate',
    ],
    madeWith: [],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'french-vanilla-body-cream',
    name: 'French Vanilla Body Cream 120mL',
    priceAud: 35,
    categorySlug: 'body',
    categoryName: 'Body',
    imagePath: '/images/products/french-vanilla-body-cream.png',
    shortDescription: 'French Vanilla Body Cream 120mL.',
    description: 'French Vanilla Body Cream 120mL.',
    howToUse: 'Massage into skin on the body after bathing or whenever skin needs nourishment.',
    benefits: [],
    madeWith: [],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'small-gift-crate-unfilled',
    name: 'Small Gift Crate — Unfilled',
    priceAud: 12,
    categorySlug: 'other',
    categoryName: 'Other',
    imagePath: '/images/products/small-gift-crate-unfilled.png',
    shortDescription:
      'Empty small gift crate. Holds 1–4 soap pieces or a cream; removable bottom becomes a soap rack. 70mm × 100mm.',
    description: `Small Gift Crate — to place 1–4 pieces of soap or a cream for the perfect gift. Bottom lifts out to become a soap rack.

70mm × 100mm.`,
    howToUse:
      'Add your choice of soap or cream inside the crate. Gift as-is. Remove the bottom insert to use as a soap rack between uses.',
    benefits: [
      'Fits 1–4 soap pieces or a cream jar',
      'Removable bottom doubles as a soap rack',
      '70mm × 100mm wooden crate',
    ],
    madeWith: [],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'shampoo-bar-sapone',
    name: 'Shampoo Bar Sapone 100g',
    priceAud: 10,
    categorySlug: 'other',
    categoryName: 'Other',
    imagePath: '/images/products/shampoo-bar-sapone.png',
    shortDescription: 'Shampoo bar sapone suitable for all hair types.',
    description: 'Suitable for all hair types.',
    howToUse: 'Wet bar and work into a lather on wet hair. Massage scalp, then rinse thoroughly.',
    benefits: [
      'Solid shampoo bar format',
      'Suitable for all hair types',
      'Sapone clay cleansing',
    ],
    madeWith: [
      'Olive & Coconut Oils',
      'Shea & Cocoa Butters',
      'Glycerin',
      'Sandalwood',
      'Rosewood',
      'Frankincense',
      'Ylang Ylang',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'christmas-star-sapone',
    name: 'Christmas Star Sapone 100g',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/christmas-star-sapone.png',
    shortDescription:
      'Christmas star soaps in mixed varieties. Suitable for all skin types.',
    description: `Christmas Star Soaps — mixed varieties — 80–100g each.

Suitable for all skin types.`,
    howToUse: 'Wet soap and work into a lather on hands or body. Rinse well after use.',
    benefits: [
      'Festive star shape',
      'Mixed varieties',
      'Suitable for all skin types',
    ],
    madeWith: [
      'Olive, Coconut & Vegetable Oils',
      'Shea & Cocoa Butters',
      'Clays',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'organic-rosehip-facial-oil',
    name: 'Organic Rosehip Facial Oil 25mL',
    priceAud: 25,
    categorySlug: 'face',
    categoryName: 'Face',
    imagePath: '/images/products/organic-rosehip-facial-oil.png',
    shortDescription:
      'Suitable for all skin types. Helps regenerate the skin’s oil production, excellent for wrinkles and scars. Absorbs quickly.',
    description: `This amazing oil is suitable for all skin types as it helps regenerate the sebum (oil) production of the skin. Excellent for wrinkles and scars, similar to the body’s natural oils. Absorbs quickly and efficiently. Can be used under normal moisturiser for that added injection of moisture or as a treatment to enhance the softness of your skin.

Suitable for all skin types.`,
    howToUse:
      'Apply a few drops to cleansed face and neck. Use alone or under moisturiser morning and evening.',
    benefits: [
      'Helps regenerate the skin’s natural oil balance',
      'Excellent for wrinkles and scars',
      'Absorbs quickly; use alone or under moisturiser',
    ],
    madeWith: ['Organic Rosehip Oil', 'No Artificial Colours or Preservatives'],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'lemon-goats-milk-sapone',
    name: 'Lemon & Goats Milk Sapone 100g',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/lemon-goats-milk-sapone.png',
    shortDescription:
      'Rich and creamy lemon and goats milk sapone. Suitable for sensitive skin.',
    description: `Rich & Creamy

Suitable for sensitive skin.`,
    howToUse: 'Wet soap and work into a lather on hands or body. Rinse well after use.',
    benefits: [
      'Rich and creamy formula',
      'Fresh goats milk and calendula',
      'Suitable for sensitive skin',
    ],
    madeWith: [
      'Olive, Coconut & Vegetable Oils',
      'Shea Butter',
      'Fresh Goats Milk',
      'Dried Calendula Flowers',
      'Lemon Myrtle',
      'Lemon & Patchouli',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'seeded-mint-pumice-scrub-sapone',
    name: 'Seeded Mint Pumice Scrub Sapone 100g',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/seeded-mint-pumice-scrub-sapone.png',
    shortDescription:
      'Exfoliating while refreshing. Seeded mint pumice scrub sapone suitable for all skin types.',
    description: `Exfoliating while Refreshing

Suitable for all skin types.`,
    howToUse: 'Wet soap and work into a lather on hands or body. Rinse well after use.',
    benefits: [
      'Exfoliating pumice and seeds',
      'Refreshing mint blend',
      'Suitable for all skin types',
    ],
    madeWith: [
      'Olive, Coconut & Vegetable Oils',
      'Shea & Cocoa Butters',
      'Oatmeal',
      'Linseeds',
      'Poppy Seeds',
      'Pumice',
      'Spearmint, Peppermint & Tea Tree',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'jojoba-beads-facial-polish',
    name: 'Jojoba Beads Facial Polish 60g',
    priceAud: 35,
    categorySlug: 'face',
    categoryName: 'Face',
    imagePath: '/images/products/jojoba-beads-facial-polish.png',
    shortDescription:
      'Jojoba wax beads gently massage away dead skin and dirt, leaving wax esters to deeply nourish.',
    description: `These amazing jojoba wax beads gently massage away dead skin and dirt and leave wax esters in the skin to deeply nourish.

Suitable for all skin types.`,
    howToUse:
      'Apply to damp face and massage gently in circular motions. Rinse thoroughly. Use 1–2 times per week.',
    benefits: [
      'Gentle jojoba wax bead exfoliation',
      'Removes dead skin and dirt',
      'Leaves nourishing wax esters on skin',
    ],
    madeWith: [
      'Aqua',
      'Macadamia Oil',
      'Shea Butter',
      'Plant Waxes',
      'Vitamin E',
      'French Active White Clay',
      'Jojoba Wax Beads',
      'Mandarin',
      'Organic Lavender',
      'Rosemary',
      'Herbal Preservative',
      'Pure Essential Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'geranium-ginger-sapone',
    name: 'Geranium & Ginger Sapone 100g',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/geranium-ginger-sapone.png',
    shortDescription:
      'Italian milled butter soap. Geranium and ginger sapone suitable for dry skin.',
    description: `Italian Milled Butter Soap

Suitable for Dry Skin.`,
    howToUse: 'Wet soap and work into a lather on hands or body. Rinse well after use.',
    benefits: [
      'Italian milled butter soap',
      'French yellow clay',
      'Suitable for dry skin',
    ],
    madeWith: [
      'Olive, Coconut & Vegetable Oils',
      'Shea & Cocoa Butters',
      'French Yellow Clay',
      'Banana',
      'Lemon',
      'Rose Geranium',
      'Sandalwood & Ginger',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'pink-rose-sapone-clay',
    name: 'Pink Rose Sapone Clay 100g',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/pink-rose-sapone-clay.png',
    shortDescription:
      'Calming and aromatic pink rose sapone clay. Suitable for sensitive skin.',
    description: `Calming & Aromatic

Suitable for sensitive skin.`,
    howToUse: 'Wet soap and work into a lather on hands or body. Rinse well after use.',
    benefits: [
      'Calming and aromatic',
      'Pink and white clays',
      'Suitable for sensitive skin',
    ],
    madeWith: [
      'Olive, Coconut & Vegetable Oils',
      'Shea & Cocoa Butters',
      'Pink & White Clays',
      'Jojoba Oil',
      'Rosewood & Rose Absolute',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'field-lavender-sapone',
    name: 'Field Lavender Sapone 100g',
    priceAud: 10,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/field-lavender-sapone.png',
    shortDescription:
      'Relaxing and soothing field lavender sapone. Suitable for sensitive skin.',
    description: `Relaxing & Soothing

Suitable for sensitive skin.`,
    howToUse: 'Wet soap and work into a lather on hands or body. Rinse well after use.',
    benefits: [
      'Relaxing and soothing',
      'Lavender and patchouli',
      'Suitable for sensitive skin',
    ],
    madeWith: [
      'Olive, Coconut & Vegetable Oils',
      'Shea & Cocoa Butters',
      'Alkanet Root',
      'Lavender & Patchouli',
      'Organic Hand Pressed Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'spicy-moroccan-aftershave-balm',
    name: 'Spicy Moroccan Aftershave Nourishing Balm 100mL',
    priceAud: 20,
    categorySlug: 'face',
    categoryName: 'Face',
    imagePath: '/images/products/spicy-moroccan-aftershave-balm.png',
    shortDescription:
      'Light, nourishing aftershave balm readily absorbed by the skin. Protects from the elements during the day.',
    description:
      'Our light and nourishing aftershave balm is readily absorbed by the skin and protects it from the elements during the day.',
    howToUse:
      'Apply a small amount to shaved skin after cleansing. Smooth gently until absorbed.',
    benefits: [
      'Light, readily absorbed formula',
      'Nourishes skin after shaving',
      'Protects from the elements',
    ],
    madeWith: [
      'Aqua',
      'Plant waxes',
      'Macadamia Nut Oil',
      'Vitamin E',
      'Rose Absolute',
      'Sandalwood & Cinnamon Bark essential oils',
      'Calendula & Comfrey Extract',
      'Natural preservatives',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'lavender-floral-toner',
    name: 'Lavender Floral Toner 100mL',
    priceAud: 15,
    categorySlug: 'face',
    categoryName: 'Face',
    imagePath: '/images/products/lavender-floral-toner.png',
    shortDescription:
      'Light floral organic hydrosol to soothe and refresh your skin after cleansing, providing a moist base for your moisturiser.',
    description: `Light floral organic hydrosol to soothe and refresh your skin after cleansing, providing a moist base for your moisturiser. Totally pure and free of artificial additives.

Suitable for all skin types.`,
    howToUse:
      'After cleansing, apply to cotton pad and sweep over face and neck, or mist lightly. Follow with moisturiser.',
    benefits: [
      'Soothes and refreshes after cleansing',
      'Provides a moist base for moisturiser',
      'Pure — no artificial additives',
      'Suitable for all skin types',
    ],
    madeWith: [
      'Organic Lavender',
      'No artificial colours or preservatives',
      'Pure essential oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'sandalwood-shaving-soap',
    name: 'Sandalwood Shaving Soap 100g',
    priceAud: 15,
    categorySlug: 'soap',
    categoryName: 'Soap',
    imagePath: '/images/products/sandalwood-shaving-soap.png',
    shortDescription:
      'Nourishing and soothing shaving soap. Apply before shaving for a close shave and smooth, nourished skin.',
    description: `Nourishing and Soothing

Apply to the face, legs or body prior to shaving to achieve a close shave leaving the skin nourished and smooth.`,
    howToUse:
      'Wet skin and work soap into a lather with a brush or hands. Shave as usual, then rinse thoroughly.',
    benefits: [
      'Nourishing and soothing',
      'Close, smooth shave',
      'Suitable for face, legs or body',
    ],
    madeWith: [
      'Olive & Coconut Oils',
      'Shea & Cocoa Butters',
      'White Kaolin Clay',
      'Glycerin',
      'Sandalwood',
      'Rosewood',
      'Frankincense & Ylang Ylang hand pressed essential oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
  {
    slug: 'green-tea-night-cream',
    name: 'Green Tea Night Cream 60g',
    priceAud: 35,
    categorySlug: 'face',
    categoryName: 'Face',
    imagePath: '/images/products/green-tea-night-cream.png',
    shortDescription:
      'Calming night moisturiser with an extra-rich anti-aging formula to nurture and replenish skin overnight.',
    description: `Drift off to sleep with the calming fragrance of this superb night moisturiser. The extra rich, anti aging formula will nurture and replenish your skin overnight.

Suitable for all skin types.`,
    howToUse:
      'Apply a small amount to cleansed face and neck each evening. Smooth gently until absorbed.',
    benefits: [
      'Calming fragrance for bedtime',
      'Extra-rich anti-aging formula',
      'Nurtures and replenishes overnight',
    ],
    madeWith: [
      'Aqua',
      'Macadamia Oil',
      'Shea & Cocoa Butters',
      'Plant Waxes',
      'Vitamin E',
      'Green Tea Extract',
      'Roman Chamomile',
      'Rose Absolute',
      'Herbal Preservative',
      'Pure Essential Oils',
    ],
    stockQuantity: 50,
    isFeatured: false,
  },
]
