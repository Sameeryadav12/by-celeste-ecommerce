import 'dotenv/config'
import { prisma } from '../config/prisma'

/**
 * Idempotent demo events seed for By Celeste.
 * Run: npm run seed:events
 */
async function main() {
  await prisma.event.upsert({
    where: { slug: 'fitzroy-autumn-popup' },
    create: {
      title: 'By Celeste Autumn Pop-Up (Fitzroy)',
      slug: 'fitzroy-autumn-popup',
      shortDescription: 'Meet the team, try textures, and build a calm body-care ritual in person.',
      description:
        'Join us at a small Fitzroy pop-up to explore By Celeste bestsellers, ask skincare questions, and discover gifting ideas for cooler weather. Walk-ins welcome while capacity lasts.',
      locationName: 'Rose Street Artist Market Hall',
      addressLine1: '60 Rose Street',
      suburb: 'Fitzroy',
      state: 'VIC',
      postcode: '3065',
      country: 'Australia',
      startDateTime: new Date('2026-04-18T10:00:00+10:00'),
      endDateTime: new Date('2026-04-18T15:00:00+10:00'),
      imageUrl:
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80',
      isPublished: true,
      isFeatured: true,
    },
    update: {
      title: 'By Celeste Autumn Pop-Up (Fitzroy)',
      shortDescription: 'Meet the team, try textures, and build a calm body-care ritual in person.',
      description:
        'Join us at a small Fitzroy pop-up to explore By Celeste bestsellers, ask skincare questions, and discover gifting ideas for cooler weather. Walk-ins welcome while capacity lasts.',
      locationName: 'Rose Street Artist Market Hall',
      addressLine1: '60 Rose Street',
      addressLine2: null,
      suburb: 'Fitzroy',
      state: 'VIC',
      postcode: '3065',
      country: 'Australia',
      startDateTime: new Date('2026-04-18T10:00:00+10:00'),
      endDateTime: new Date('2026-04-18T15:00:00+10:00'),
      imageUrl:
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80',
      isPublished: true,
      isFeatured: true,
    },
  })

  await prisma.event.upsert({
    where: { slug: 'winter-skin-barrier-evening' },
    create: {
      title: 'Winter Skin Barrier Evening',
      slug: 'winter-skin-barrier-evening',
      shortDescription: 'A guided evening session on dryness, barrier care, and ingredient choices.',
      description:
        'This evening session focuses on practical routines for sensitive winter skin. We cover cleansing, layering, and common ingredient myths in a small, Q&A-friendly format.',
      locationName: 'Brunswick Wellness Studio',
      addressLine1: '14 Sydney Road',
      suburb: 'Brunswick',
      state: 'VIC',
      postcode: '3056',
      country: 'Australia',
      startDateTime: new Date('2026-06-04T18:30:00+10:00'),
      endDateTime: new Date('2026-06-04T20:00:00+10:00'),
      imageUrl:
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1400&q=80',
      isPublished: true,
      isFeatured: false,
    },
    update: {
      title: 'Winter Skin Barrier Evening',
      shortDescription: 'A guided evening session on dryness, barrier care, and ingredient choices.',
      description:
        'This evening session focuses on practical routines for sensitive winter skin. We cover cleansing, layering, and common ingredient myths in a small, Q&A-friendly format.',
      locationName: 'Brunswick Wellness Studio',
      addressLine1: '14 Sydney Road',
      addressLine2: null,
      suburb: 'Brunswick',
      state: 'VIC',
      postcode: '3056',
      country: 'Australia',
      startDateTime: new Date('2026-06-04T18:30:00+10:00'),
      endDateTime: new Date('2026-06-04T20:00:00+10:00'),
      imageUrl:
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1400&q=80',
      isPublished: true,
      isFeatured: false,
    },
  })

  await prisma.event.upsert({
    where: { slug: 'spring-gifting-preview-evening' },
    create: {
      title: 'Spring Gifting Preview Evening',
      slug: 'spring-gifting-preview-evening',
      shortDescription: 'Preview limited seasonal gifting sets before wider release.',
      description:
        'A calm after-hours session for discovering spring gifting bundles, event-only wrapping options, and curated recommendations for birthdays and thank-you gifts.',
      locationName: 'By Celeste Collingwood Studio',
      addressLine1: '21 Peel Street',
      suburb: 'Collingwood',
      state: 'VIC',
      postcode: '3066',
      country: 'Australia',
      startDateTime: new Date('2026-09-10T18:00:00+10:00'),
      endDateTime: new Date('2026-09-10T20:30:00+10:00'),
      imageUrl:
        'https://images.unsplash.com/photo-1464890100898-a385f744067f?auto=format&fit=crop&w=1400&q=80',
      isPublished: true,
      isFeatured: false,
    },
    update: {
      title: 'Spring Gifting Preview Evening',
      shortDescription: 'Preview limited seasonal gifting sets before wider release.',
      description:
        'A calm after-hours session for discovering spring gifting bundles, event-only wrapping options, and curated recommendations for birthdays and thank-you gifts.',
      locationName: 'By Celeste Collingwood Studio',
      addressLine1: '21 Peel Street',
      addressLine2: null,
      suburb: 'Collingwood',
      state: 'VIC',
      postcode: '3066',
      country: 'Australia',
      startDateTime: new Date('2026-09-10T18:00:00+10:00'),
      endDateTime: new Date('2026-09-10T20:30:00+10:00'),
      imageUrl:
        'https://images.unsplash.com/photo-1464890100898-a385f744067f?auto=format&fit=crop&w=1400&q=80',
      isPublished: true,
      isFeatured: false,
    },
  })

  await prisma.event.upsert({
    where: { slug: 'summer-market-recap-2025' },
    create: {
      title: 'Summer Market Recap 2025',
      slug: 'summer-market-recap-2025',
      shortDescription: 'A past market event showcasing seasonal body-care favourites.',
      description:
        'This archive entry represents a previous in-person market day, used to demonstrate optional past-event listing and detail rendering.',
      locationName: 'St Kilda Foreshore Pavilion',
      addressLine1: '10 The Esplanade',
      suburb: 'St Kilda',
      state: 'VIC',
      postcode: '3182',
      country: 'Australia',
      startDateTime: new Date('2025-12-14T09:00:00+11:00'),
      endDateTime: new Date('2025-12-14T14:00:00+11:00'),
      imageUrl: null,
      isPublished: true,
      isFeatured: false,
    },
    update: {
      title: 'Summer Market Recap 2025',
      shortDescription: 'A past market event showcasing seasonal body-care favourites.',
      description:
        'This archive entry represents a previous in-person market day, used to demonstrate optional past-event listing and detail rendering.',
      locationName: 'St Kilda Foreshore Pavilion',
      addressLine1: '10 The Esplanade',
      addressLine2: null,
      suburb: 'St Kilda',
      state: 'VIC',
      postcode: '3182',
      country: 'Australia',
      startDateTime: new Date('2025-12-14T09:00:00+11:00'),
      endDateTime: new Date('2025-12-14T14:00:00+11:00'),
      imageUrl: null,
      isPublished: true,
      isFeatured: false,
    },
  })

  // Retire earlier workshop-branded slug if it exists from prior seeds.
  await prisma.event.updateMany({
    where: { slug: 'winter-skin-barrier-workshop' },
    data: { isPublished: false, isFeatured: false },
  })

  console.log('[seedEvents] Upserted 4 events (3 upcoming, 1 past) and retired workshop slug.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (err) => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })
