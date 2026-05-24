import { Link, useParams } from 'react-router-dom'

import { Seo } from '../components/seo/Seo'

import { Card } from '../components/ui/Card'

import { BUSINESS_DETAILS } from '../config/businessDetails'

import { POLICIES } from '../config/policies'



export function PolicyPage() {

  const { slug } = useParams<{ slug: string }>()

  const policy = slug ? POLICIES[slug] : undefined



  if (!policy) {

    return (

      <>

        <Seo title="Page not found | By Celeste" />

        <p className="text-sm text-neutral-600">This policy page could not be found.</p>

        <Link to="/" className="mt-4 inline-block text-sm font-medium text-neutral-900 underline">

          Back to home

        </Link>

      </>

    )

  }



  return (

    <>

      <Seo title={`${policy.title} | By Celeste`} description={policy.description} />

      <div className="mx-auto max-w-2xl space-y-6">

        <div>

          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{policy.title}</h1>

          <p className="mt-2 text-sm text-neutral-600">{policy.description}</p>

        </div>

        <Card className="space-y-4 text-sm leading-relaxed text-neutral-700">

          {policy.paragraphs.map((p) => (

            <p key={p}>{p}</p>

          ))}

          <p className="border-t border-neutral-100 pt-4 text-neutral-600">

            {BUSINESS_DETAILS.name} · {BUSINESS_DETAILS.abnDisplay}

            <br />

            <a

              href={`mailto:${BUSINESS_DETAILS.supportEmail}`}

              className="font-medium text-neutral-900 underline underline-offset-2"

            >

              {BUSINESS_DETAILS.supportEmail}

            </a>

          </p>

        </Card>

        <Link to="/" className="text-sm font-medium text-neutral-700 underline underline-offset-2">

          Back to home

        </Link>

      </div>

    </>

  )

}

