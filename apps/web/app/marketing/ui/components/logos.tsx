import Container from '#marketing/ui/components/container'
import ufrrjLogo from '../images/ufrrj.png'
import atislabsLogo from '../images/atislabs.png'

export default function LogosSection() {
  return (
    <section>
      <div className="bg-background text-foreground py-24 sm:py-32">
        <Container>
          <h2 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Developed by
          </h2>
          <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-12 grayscale opacity-70 hover:opacity-100 transition-opacity">
            <a href="https://atislabs.com.br" target="_blank" rel="noreferrer">
              <span className="sr-only">AtisLabs</span>
              <img alt="ATISLabs" src={atislabsLogo} className="h-10 w-auto object-contain" />
            </a>
            <a href="https://portal.ufrrj.br" target="_blank" rel="noreferrer">
              <span className="sr-only">UFRRJ</span>
              <img alt="UFRRJ" src={ufrrjLogo} className="h-12 w-auto object-contain" />
            </a>
          </div>
        </Container>
      </div>
    </section>
  )
}
