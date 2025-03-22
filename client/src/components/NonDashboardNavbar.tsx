"use client"
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { Bell, BookOpen } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const NonDashboardNavbar = () => {
    const {user} = useUser()
    const userRole = user?.publicMetadata?.userType as "student" | "teacher"; //should not be undefined;

    return (
    <nav className='nondashboard-navbar'>
        {/* the __subject way of writing components is called block element modifiers */}
        <div  className='nondashboard-navbar__container'>
            <div className='nondashboard-navbar__search'>
                <Link href="/"  className='nondashboard-navbar__brand'> 
                    Learn-rl
                </Link>
                <div className='flex items-center gap-4'>
                    <div  className='relative group flex items-center'>
                        <Link href="/search"  className='nondashboard-navbar__search-input'>
                            <span className='hidden sm:inline'>Search Courses</span>
                            <span className='sm:hidden'>Search</span>
                        </Link>
                        <BookOpen
                            className='nondashboard-navbar__search-icon'
                            size={18} />
                    </div>
                </div>
            </div>
        </div>
        <div className='nondashboard-navbar__actions'>
            <button className='nondashbnoard-navbar__notification-button relative'>
                <Bell className='nondashboard-navbar__notification-icon'/>
            </button>

            {/* SIGN IN & SIGN UP buttons*/}
            <SignedIn>
                {/* ISSUE THE USER NAME NEEDS TO BE VISIBLE BUT CURRENTLY IS NOT! */}
                <UserButton 
                    // showName={true}
                    userProfileMode="navigation"
                    userProfileUrl={
                        userRole === "teacher"? "/teacher/profile" : "/user/profile"
                    }

                    // appearance={{
                    //     elements: {
                    //       userButtonBox: "flex gap-2 items-center", // Ensure proper alignment
                    //       userButtonText: "text-white font-medium", // Light gray text
                    //       userButtonUsername: "text-white hover:text-white", // Directly target username
                    //       avatarBox: "h-8 w-8", // Ensure avatar doesn't squeeze text
                    //     }
                    //   }}
                />
            </SignedIn>
            <SignedOut>
                <Link href='/signin'  className='nondashboard-navbar__auth-button--login'>
                    Log in
                </Link>
                <Link href='/signup'  className='nondashboard-navbar__auth-button--signup'>
                    Sign up
                </Link>
            </SignedOut>
        </div>
    </nav>
  )
}

export default NonDashboardNavbar