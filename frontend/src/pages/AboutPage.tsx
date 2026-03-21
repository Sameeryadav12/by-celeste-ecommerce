import { Card } from '../components/ui/Card'
import { Seo } from '../components/seo/Seo'
import { Link } from 'react-router-dom'
import { BUSINESS_ADDRESS, formatBusinessAddressLine } from '../config/businessAddress'

export function AboutPage() {
  return (
    <>
      <Seo
        title="About By Celeste | Calm Australian skincare"
        description="Meet Jane and the story behind By Celeste — handcrafted skincare in regional Victoria with Australian botanicals and cruelty-free care."
      />
      <section className="space-y-10">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            About By Celeste
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-neutral-700">
            By Celeste is an Australian skincare brand built on patience, place, and respect for
            skin. We believe calm routines and honest ingredients beat loud promises.
          </p>
        </div>

        <Card className="max-w-3xl">
          <h2 className="text-sm font-semibold text-neutral-900">Jane &amp; the beginning</h2>
          <p className="mt-3 text-sm leading-7 text-neutral-700">
            By Celeste grew from Jane&apos;s own search for skincare that felt gentle, considered,
            and true to Australia — not another imported trend repackaged for our shelves. Working from{' '}
            {formatBusinessAddressLine()}, she focuses on small batches, careful sourcing, and formulas
            that support the skin barrier without unnecessary drama.
          </p>
          <p className="mt-3 text-sm leading-7 text-neutral-700">
            What started as kitchen-table experiments and local market tables has become a
            boutique line for people who want something personal: native botanicals they can read
            about, textures that feel spa-quiet, and a founder who still shows up at events to
            listen to customers.
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <h2 className="text-sm font-semibold text-neutral-900">Regional Victoria</h2>
            <p className="mt-2 text-xs leading-5 text-neutral-700">
              We&apos;re rooted outside the big-city rush in {BUSINESS_ADDRESS.suburb}. That distance
              helps us keep decisions human-sized — from how we blend to how we host workshops and
              pop-ups around Victoria.
            </p>
            <address className="mt-3 border-t border-neutral-100 pt-3 text-[11px] leading-5 text-neutral-600 not-italic">
              <span className="font-medium text-neutral-800">Studio</span>
              <br />
              {BUSINESS_ADDRESS.street}
              <br />
              {BUSINESS_ADDRESS.suburb} {BUSINESS_ADDRESS.state} {BUSINESS_ADDRESS.postcode}
              <br />
              {BUSINESS_ADDRESS.country}
            </address>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold text-neutral-900">Australian ingredients</h2>
            <p className="mt-2 text-xs leading-5 text-neutral-700">
              Kakadu Plum, Desert Lime, Quandong, Banksia, Lemon Myrtle, and other natives appear
              across our range. We celebrate them on every product page because knowing what
              touches your skin should be easy.
            </p>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold text-neutral-900">Cruelty-free &amp; careful</h2>
            <p className="mt-2 text-xs leading-5 text-neutral-700">
              We don&apos;t test on animals. Products are made in Australia with an emphasis on
              transparency — so you can shop with confidence, whether you&apos;re new to the brand
              or stocking your bathroom shelf for the long haul.
            </p>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/shop"
            className="rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
          >
            Shop the range
          </Link>
          <Link
            to="/events"
            className="rounded-md px-4 py-2.5 text-sm font-medium text-neutral-800 ring-1 ring-neutral-300 transition hover:bg-neutral-100"
          >
            See upcoming events
          </Link>
        </div>
      </section>
    </>
  )
}
