import Container from '#marketing/ui/components/container'

export default function FooterSection() {
  return (
    <footer className="border-t bg-background/50 backdrop-blur-xl">
      <Container className="flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by <span className="font-medium text-foreground">ATISLabs</span>. The source code
            is available on{' '}
            <a
              href="https://github.com/filipebraida/adonisjs-starter-kit"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </Container>
    </footer>
  )
}
