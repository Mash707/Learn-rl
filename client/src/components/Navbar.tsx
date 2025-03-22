"use client"
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { Bell, BookOpen, Search } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

const Navbar = ({isCoursePage} : {isCoursePage: boolean}) => {
    const {user} = useUser()
    const userRole = user?.publicMetadata?.userType as "student" | "teacher"; //should not be undefined;

    return (
    <nav className="border-b border-gray-800 bg-[#0b1120] py-3 px-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
                {/* Only show this on mobile, in desktop sidebar has the branding */}
                <Link href="/" className="text-white font-bold text-xl md:hidden">
                    Learn-rl
                </Link>
                
                <div className="relative flex items-center">
                    <div className="relative flex items-center rounded-md bg-gray-800/50 px-3 py-1.5">
                        <Search className="h-4 w-4 text-gray-400 mr-2" />
                        <input 
                            type="text" 
                            placeholder="Search courses..." 
                            className="bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none w-[180px] md:w-auto"
                        />
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button className="text-gray-400 hover:text-white">
                    <Bell className="h-5 w-5" />
                </button>

                <SignedIn>
                    <UserButton 
                        userProfileMode="navigation"
                        userProfileUrl={
                            userRole === "teacher"? "/teacher/profile" : "/user/profile"
                        }
                        appearance={{
                            elements: {
                                userButtonAvatarBox: "h-8 w-8",
                            }
                        }}
                    />
                </SignedIn>
                <SignedOut>
                    <Link href='/signin' className="text-gray-300 hover:text-white text-sm font-medium">
                        Log in
                    </Link>
                    <Link href='/signup' className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium text-white transition">
                        Sign up
                    </Link>
                </SignedOut>
            </div>
        </div>
    </nav>
  )
}

export default Navbar