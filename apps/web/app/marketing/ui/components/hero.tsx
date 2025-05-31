import { Link } from '@tuyau/inertia/react'

import { Button } from '@workspace/ui/components/button'

import featureUsers from '../images/feature_users.png'

export default function HeroSection() {
  return (
    <section className="overflow-hidden py-32">
      <div className="container">
        <div className="flex flex-col gap-5">
          <div className="relative flex flex-col gap-5">
            <div
              style={{
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute left-1/2 top-1/2 -z-10 mx-auto size-[800px] rounded-full border p-16 [mask-image:linear-gradient(to_top,transparent,transparent,white,white,white,transparent,transparent)] md:size-[1300px] md:p-32"
            >
              <div className="size-full rounded-full border p-16 md:p-32">
                <div className="size-full rounded-full border"></div>
              </div>
            </div>
            <h2 className="mx-auto mt-8 md:mt-16 max-w-screen-lg text-balance text-center text-3xl font-medium md:text-6xl">
              AdonisJS Starter Kit
            </h2>
            <p className="mx-auto max-w-screen-md text-center text-muted-foreground md:text-lg">
              Accelerate development with a well-structured monorepo, ShadCN, and optimized
              components. Everything ready for you to build scalable and modern projects.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 pb-12 pt-3">
              <Button size="lg" asChild>
                <Link route="auth.sign_in.show">Get Started</Link>
              </Button>
              <div className="text-xs text-muted-foreground">
                The Ultimate Starter Kit for AdonisJS
              </div>
            </div>
          </div>
          <img
            src={featureUsers}
            alt="AdonsisJS Starter Kit"
            className="mx-auto border h-full max-h-[524px] w-full max-w-screen-lg rounded-2xl object-cover"
          />
        </div>
      </div>
    </section>
  )
}
