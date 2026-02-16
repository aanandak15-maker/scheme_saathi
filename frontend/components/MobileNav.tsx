"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';

export const MobileNav = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-16 left-0 w-full bg-white border-b border-border/40 shadow-xl p-6 flex flex-col gap-4 z-40"
                    >
                        <Link href="/" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-brand-saffron p-2 bg-gray-50 rounded-lg">Home</Link>
                        <Link href="/check-eligibility" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-brand-saffron p-2 bg-gray-50 rounded-lg">Check Eligibility</Link>
                        <Link href="/schemes" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-brand-saffron p-2 bg-gray-50 rounded-lg">Schemes</Link>
                        <Link href="/csc/dashboard" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-brand-saffron p-2 bg-gray-50 rounded-lg">CSC Portal</Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
