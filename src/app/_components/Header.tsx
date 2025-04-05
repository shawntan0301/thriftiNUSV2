"use client";


import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";


const Header = () => {
 const { user, isSignedIn } = useUser();


 return (
   <header className="flex justify-between items-center p-4 border-b shadow-sm">
     {/* Logo */}
     <Link href="/" className="text-2xl font-bold text-blue-600">
       Thrifti<span className="text-orange-500">NUS</span>
     </Link>


     {/* Center nav */}
     <nav className="space-x-6 text-gray-600 text-sm">
       <Link href="/category/electronics">Electronics</Link>
       <Link href="/category/fashion">Fashion</Link>
       <Link href="/category/bedding">Bedding</Link>
       <Link href="/category/cleaning">Cleaning</Link>
     </nav>


     {/* Right section */}
     {isSignedIn ? (
       <div className="flex items-center gap-4">
       <UserButton />
       <span>
         Hello, <span className="text-orange-500 font-semibold">{user.firstName}</span>
       </span>
       <Link
         href="/sell"
         className="bg-orange-500 text-white px-4 py-1.5 rounded-full font-semibold"
       >
         Sell
       </Link>
     </div>
    
     ) : (
       <div className="flex items-center gap-4">
         <Link href="/register" className="text-sm">Register</Link>
         <Link href="/login" className="text-sm">Login</Link>
         <Link href="/sell" className="bg-orange-500 text-white px-4 py-1.5 rounded-full font-semibold">
           Sell
         </Link>
       </div>
     )}
   </header>
 );
};


export default Header;


