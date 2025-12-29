import Container from '#marketing/ui/components/container'
import { Link } from '@tuyau/inertia/react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import featureForgot from '../images/feature_forgot.png'
import featureUsers from '../images/feature_users.png'

export default function FeatureShowcase() {
  return (
    <section className="py-24 space-y-32">
      {/* Feature 1: Dashboard */}
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-primary bg-primary/10 border-primary/20 w-fit">
              Dashboard
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl text-balance">
              Manage your users with confidence
            </h2>
            <p className="text-lg text-muted-foreground text-balance">
              Control usage, manage roles, and oversee your application with a production-ready
              dashboard. User impersonation and API token management included.
            </p>
            <ul className="flex flex-col gap-3 mt-4 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                <span>Role-Based Access Control (RBAC)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                <span>User Impersonation for Support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                <span>Sortable & Filterable Data Tables</span>
              </li>
            </ul>
            <div className="pt-4">
              <Button variant="outline" asChild className="rounded-full gap-2">
                <Link route="auth.sign_in.show">
                  Explore Dashboard <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="rounded-3xl border bg-muted/20 p-2 lg:-mr-20">
              <img
                src={featureUsers}
                alt="User Dashboard"
                className="rounded-2xl shadow-2xl border w-full"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* Feature 2: Authentication */}
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="rounded-3xl border bg-muted/20 p-2 lg:-ml-20">
              <img
                src={featureForgot}
                alt="Authentication Screens"
                className="rounded-2xl shadow-2xl border w-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-primary bg-primary/10 border-primary/20 w-fit">
              Security
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl text-balance">
              Authentication that just works
            </h2>
            <p className="text-lg text-muted-foreground text-balance">
              Don't spend weeks building login forms. We provide a complete authentication system
              with social login, password recovery, and secure sessions.
            </p>
            <ul className="flex flex-col gap-3 mt-4 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                <span>Google & GitHub OAuth Ready</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                <span>Secure Password Hashing (Argon2id)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                <span>Automated Email Recovery Flow</span>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}
