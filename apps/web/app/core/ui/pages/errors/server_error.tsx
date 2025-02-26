import { router } from '@inertiajs/react'

import { Button } from '@workspace/ui/components/button'

export default function ServerError() {
  return (
    <div className="h-svh w-full">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] font-bold leading-tight">500</h1>
        <span className="font-medium">Oops! Something went wrong {`:')`}</span>
        <p className="text-center text-muted-foreground">
          We apologize for the inconvenience. <br /> Please try again later.
        </p>

        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.visit('/')}>Back to Home</Button>
        </div>
      </div>
    </div>
  )
}
