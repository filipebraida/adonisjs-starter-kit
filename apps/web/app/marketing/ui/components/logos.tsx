import ufrrjLogo from '../images/ufrrj.png'
import atislabsLogo from '../images/atislabs.png'

export default function LogosSection() {
  return (
    <section>
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-lg/8 font-semibold text-gray-900">Developed by</h2>
          <div className="mx-auto mt-10 max-w-lg grid grid-cols-6 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            <a href="https://atislabs.com.br" target="_blank" rel="noreferrer">
              <span className="sr-only">AtisLabs</span>
              <img
                alt="ATISLabs"
                src={atislabsLogo}
                className="col-span-2 max-w-36 w-full object-contain lg:col-span-1"
              />
            </a>
            <a href="https://portal.ufrrj.br" target="_blank" rel="noreferrer">
              <span className="sr-only">UFRRJ</span>
              <img
                alt="UFRRJ"
                src={ufrrjLogo}
                className="col-span-2 max-w-28 w-full object-contain lg:col-span-1"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
