import featureForgot from '../images/feature_forgot.png'
import featureLogin from '../images/feature_login.png'
import featureTheme from '../images/feature_theme.png'
import featureUsers from '../images/feature_users.png'

export default function FeatureSection() {
  return (
    <section className="mt-24" id="features">
      <div className="container">
        <div className="mb-24 flex flex-col items-center gap-6">
          <h1 className="text-center text-3xl font-semibold lg:max-w-3xl lg:text-5xl">
            Essential Features for a Seamless Experience
          </h1>
          <p className="text-center text-lg font-medium text-muted-foreground md:max-w-4xl lg:text-xl">
            Explore the key functionalities designed to enhance usability, security, and
            customization.
          </p>
        </div>
        <div className="relative flex justify-center">
          <div className="relative flex w-full flex-col border border-muted2 md:w-1/2 lg:w-full">
            <div className="relative flex flex-col lg:flex-row">
              <div className="flex flex-col justify-between border-b border-solid border-muted2 p-10 lg:w-3/5 lg:border-b-0 lg:border-r">
                <h2 className="text-xl font-semibold">Forgot Password Recovery</h2>
                <p className="text-muted-foreground">
                  Easily recover your password with our secure and user-friendly reset process.
                </p>
                <img
                  src={featureForgot}
                  alt="Forgot Password Recovery"
                  className="mt-8 border aspect-[1.5] h-full w-full object-cover lg:aspect-[2.4]"
                />
              </div>
              <div className="flex flex-col justify-between p-10 lg:w-2/5">
                <h2 className="text-xl font-semibold">Secure Login System</h2>
                <p className="text-muted-foreground">
                  Authenticate safely with our robust login mechanism ensuring maximum security.
                </p>
                <img
                  src={featureLogin}
                  alt="Secure Login System"
                  className="mt-8 border aspect-[1.45] h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="relative flex flex-col border-t border-solid border-muted2 lg:flex-row">
              <div className="flex flex-col justify-between border-b border-solid border-muted2 p-10 lg:w-2/5 lg:border-b-0 lg:border-r">
                <h2 className="text-xl font-semibold">Customizable Theme</h2>
                <p className="text-muted-foreground">
                  Personalize your experience with a flexible and adaptable theme system.
                </p>
                <img
                  src={featureTheme}
                  alt="Customizable Theme"
                  className="mt-8 border aspect-[1.45] h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between p-10 lg:w-3/5">
                <h2 className="text-xl font-semibold">User Management</h2>
                <p className="text-muted-foreground">
                  Effortlessly manage users and roles with intuitive controls and administrative
                  tools.
                </p>
                <img
                  src={featureUsers}
                  alt="User Management"
                  className="mt-8 border aspect-[1.5] h-full w-full object-cover lg:aspect-[2.4]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
