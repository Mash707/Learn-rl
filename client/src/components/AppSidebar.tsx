import { ClerkLoading, useClerk, useUser } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { BookOpen, Briefcase, ChevronLeft, ChevronRight, DollarSign, LogOut, Menu, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const AppSidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {user, isLoaded} = useUser();
    const {signOut} = useClerk();
    const pathname = usePathname();
    const router = useRouter();

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const navLinks = {
        student: [
            {icon: BookOpen, label: "Courses", href: "/user/courses"},
            {icon: Briefcase, label: "Billing", href: "/billing"},
            {icon: User, label: "Profile", href: "/user/profile"},
            {icon: Settings, label: "Settings", href: "/user/settings"}
        ],
        teacher: [
            {icon: BookOpen, label: "Courses", href: "/teacher/courses"},
            {icon: DollarSign, label: "Billing", href: "/billing"},
            {icon: User, label: "Profile", href: "/teacher/profile"},
            {icon: Settings, label: "Settings", href: "/teacher/settings"}
        ]
    };

    const handleSignOut = () => {
        signOut(() => {
            router.push('/');
        });
    };

    if(!isLoaded) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if(!user) return <div className="flex justify-center items-center h-screen">User not found</div>;

    const userType = (user.publicMetadata.userType as "student" | "teacher") || "student";
    const currentNavLinks = navLinks[userType];

    return (
        <div 
            className={cn(
                "h-full bg-[#0b1120] border-r border-gray-800 shadow-lg transition-all duration-300 flex flex-col",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header with branding */}
            <div className="py-5 px-4 border-b border-gray-800 flex items-center justify-between">
                {collapsed ? (
                    <button 
                        onClick={toggleSidebar} 
                        className="text-gray-400 hover:text-white mx-auto"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                ) : (
                    <>
                        <h1 className="text-white font-bold text-xl">Learn-rl</h1>
                        <button 
                            onClick={toggleSidebar} 
                            className="text-gray-400 hover:text-white"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                    </>
                )}
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-6 overflow-y-auto">
                <nav className="space-y-1 px-3">
                    {currentNavLinks.map((link) => {
                        const isActive = pathname.startsWith(link.href);
                        return (
                            <Link 
                                key={link.href} 
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors",
                                    isActive 
                                        ? "bg-blue-600 text-white" 
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white",
                                    collapsed && "justify-center px-2"
                                )}
                            >
                                <link.icon className={cn("flex-shrink-0", collapsed ? "h-6 w-6" : "h-5 w-5")} />
                                {!collapsed && (
                                    <span className="whitespace-nowrap">
                                        {link.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Sign Out Button */}
            <div className="border-t border-gray-800 p-4">
                <button
                    onClick={handleSignOut}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors",
                        collapsed && "justify-center px-2"
                    )}
                >
                    <LogOut className={cn("flex-shrink-0", collapsed ? "h-6 w-6" : "h-5 w-5")} />
                    {!collapsed && <span className="font-medium">Sign Out</span>}
                </button>
            </div>
        </div>
    );
};

export default AppSidebar;