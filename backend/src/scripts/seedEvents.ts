import 'dotenv/config'
import { prisma } from '../config/prisma'

function demoDayWindow(
  base: Date,
  daysFromToday: number,
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
) {
  const start = new Date(base)
  start.setDate(start.getDate() + daysFromToday)
  start.setHours(startHour, startMinute, 0, 0)
  const end = new Date(base)
  end.setDate(end.getDate() + daysFromToday)
  end.setHours(endHour, endMinute, 0, 0)
  return { start, end }
}

/**
 * Idempotent demo events seed for By Celeste.
 * Run: npm run seed:events
 *
 * Dates are anchored to the day the seed runs so upcoming/past demos stay valid.
 */
export async function runSeedEvents() {
  const base = new Date()
  const fitzroy = demoDayWindow(base, 14, 10, 0, 15, 0)
  const winter = demoDayWindow(base, 45, 18, 30, 20, 0)
  const spring = demoDayWindow(base, 90, 18, 0, 20, 30)
  const recapPast = demoDayWindow(base, -40, 9, 0, 14, 0)

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
      startDateTime: fitzroy.start,
      endDateTime: fitzroy.end,
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
      startDateTime: fitzroy.start,
      endDateTime: fitzroy.end,
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
      startDateTime: winter.start,
      endDateTime: winter.end,
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
      startDateTime: winter.start,
      endDateTime: winter.end,
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
      startDateTime: spring.start,
      endDateTime: spring.end,
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
      startDateTime: spring.start,
      endDateTime: spring.end,
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
      startDateTime: recapPast.start,
      endDateTime: recapPast.end,
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
      startDateTime: recapPast.start,
      endDateTime: recapPast.end,
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

  console.log(
    '[seedEvents] Upserted 4 events (3 upcoming from today+14/+45/+90 days, 1 past at today-40) and retired workshop slug.',
  )
}

function isSeedEventsCli() {
  const entry = (process.argv[1] ?? '').replace(/\\/g, '/')
  return /(^|\/)seedEvents\.(ts|js|mjs|cjs)$/.test(entry)
}

if (isSeedEventsCli()) {
  runSeedEvents()
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (err) => {
      console.error(err)
      await prisma.$disconnect()
      process.exit(1)
    })
}
