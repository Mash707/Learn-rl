"use client"

import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { ClerkLoading, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation"
import { useState } from "react";

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    const pathname = usePathname();
    const {user, isLoaded} = useUser();
    
    // Check if the current page is a course page
    const isCoursePage = pathname.includes("/courses/");

    if(!isLoaded) return (
        <div className="flex justify-center items-center h-screen bg-[#0b1120]">
            <ClerkLoading />
        </div>
    );

    if(!user) return (
        <div className="flex justify-center items-center h-screen bg-[#0b1120] text-white text-lg">
            Please sign-in to access this page
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#0b1120]">
            <AppSidebar />
            <div className="flex-1 overflow-auto flex flex-col">
                <Navbar isCoursePage={isCoursePage} />
                <main className="p-6 text-white flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}