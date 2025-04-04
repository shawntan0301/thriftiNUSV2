import Link from 'next/link'
import MaxWidthWrapper from './MaxWidthWrapper'
import ThriftiNUS from 'public/ThriftiNUS.svg'
import NavItems from './NavItems'
import { buttonVariants } from './ui/button'
import Cart from './Cart'
import { cookies } from 'next/headers'
import MobileNav from './MobileNav'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

const Navbar = async () => {
  const nextCookies = cookies()

  return (
    <div className='bg-white sticky z-50 top-0 inset-x-0 h-16'>
      <header className='relative bg-white'>
        <MaxWidthWrapper>
          <div className='border-b border-gray-200'>
            <div className='flex h-16 items-center'>
              <MobileNav />

              <div className='ml-4 flex lg:ml-0'>
                <Link href='/'>
                  <img src={ThriftiNUS.src} alt="ThriftiNUS" className="h-3 w-auto" />
                </Link>
              </div>

              <div className='hidden z-50 lg:ml-8 lg:block lg:self-stretch'>
                <NavItems />
              </div>

              <div className='ml-auto flex items-center space-x-4'>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button
                      className={buttonVariants({
                        variant: 'ghost',
                      })}
                    >
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                  <div className='ml-4 flow-root lg:ml-6'>
                    <Cart />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  )
}

export default Navbar