import { Link } from 'react-router-dom'
import { Seo } from '../components/seo/Seo'
import { Card } from '../components/ui/Card'
import { SmartImage } from '../components/media/SmartImage'
import { Reveal } from '../components/animation/Reveal'
import { BUSINESS_DETAILS } from '../config/businessDetails'

const ABOUT_HERO_IMAGE = '/images/about/about-product-autumn.png'

export function AboutPage() {
  return (
    <>
      <Seo
        title="About us | By Celeste"
        description="Established in Albury NSW in 2006, By Celeste crafts nourishing clay and body products by hand using ingredients from local orchards, vineyards and olive groves."
      />

      <section className="space-y-12 sm:space-y-14">
        <Reveal className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14 xl:gap-16">
          <SmartImage
            src={ABOUT_HERO_IMAGE}
            alt="By Celeste body cream among autumn leaves"
            wrapperClassName="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200/80 sm:aspect-[5/6] lg:aspect-[4/5]"
            imgClassName="object-cover object-center"
            loading="eager"
          />

          <div className="flex flex-col justify-center space-y-5 lg:py-4">
            <p className="text-sm font-medium tracking-wide text-neutral-600">By Celeste</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              About us
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-neutral-700 sm:text-[1.0625rem] sm:leading-[1.75]">
              Established in Albury NSW in 2006, our Nourishing sapone clay and body products are
              handmade and hand cut by our Master Soap Maker using raw ingredients sourced from local
              orchards, vineyards and olive groves.
            </p>
            <p className="text-sm font-medium text-neutral-800">
              Wholesale and Private Label available
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/shop"
                className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
              >
                Shop the range
              </Link>
              <Link
                to="/wholesale/apply"
                className="rounded-md px-5 py-2.5 text-sm font-medium text-neutral-800 ring-1 ring-neutral-300 transition hover:bg-neutral-100"
              >
                Wholesale enquiry
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal className="grid gap-4 md:grid-cols-3">
          <Card>
            <h2 className="text-sm font-semibold text-neutral-900">Handmade in Australia</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              Small batches, hand cut and carefully finished — the same care that has defined the
              brand since 2006.
            </p>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold text-neutral-900">Local sourcing</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              Raw ingredients from regional orchards, vineyards and olive groves keep formulas rooted
              in place and season.
            </p>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold text-neutral-900">Cruelty-free</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              We do not test on animals. Explore ingredients on each product page and shop with
              confidence.
            </p>
          </Card>
        </Reveal>

        <Reveal>
          <Card>
            <h2 className="text-sm font-semibold text-neutral-900">Contact</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              {BUSINESS_DETAILS.name} · {BUSINESS_DETAILS.abnDisplay}
              <br />
              {BUSINESS_DETAILS.addressLine}
            </p>
            <p className="mt-3 text-sm text-neutral-700">
              <a
                href={`mailto:${BUSINESS_DETAILS.supportEmail}`}
                className="font-medium text-neutral-900 underline underline-offset-2"
              >
                {BUSINESS_DETAILS.supportEmail}
              </a>
            </p>
          </Card>
        </Reveal>

        <Reveal>
          <Link
            to="/events"
            className="inline-flex rounded-md px-5 py-2.5 text-sm font-medium text-neutral-800 ring-1 ring-neutral-300 transition hover:bg-neutral-100"
          >
            See upcoming events
          </Link>
        </Reveal>
      </section>
    </>
  )
}
