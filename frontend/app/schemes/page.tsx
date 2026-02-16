"use client"

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Scheme } from '@/types';
import { SchemeCard } from '@/components/SchemeCard';
import { Input } from '@/components/ui/input';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ["All", "Agriculture", "Housing", "Education", "Health", "Business", "Women", "Social Welfare"];

export default function AllSchemesPage() {
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        api.getSchemes().then(data => {
            setSchemes(data);
            setLoading(false);
        });
    }, []);

    // Derived categories from actual data + defaults
    const availableCategories = ["All", ...Array.from(new Set(schemes.map(s => s.category)))];

    const filteredSchemes = schemes.filter(s => {
        const matchesSearch = s.scheme_name.toLowerCase().includes(search.toLowerCase()) ||
            (s.scheme_name_hindi?.includes(search) ?? false) ||
            (s.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
        const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container mx-auto px-4 py-12 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div className="space-y-2 text-center md:text-left">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Explore Schemes</h1>
                    <p className="text-muted-foreground">Find government benefits tailored to your needs.</p>
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-brand-saffron transition-colors" />
                    <Input
                        placeholder="Search schemes..."
                        className="pl-10 h-12 bg-white rounded-full border-border/50 shadow-sm focus-visible:ring-brand-saffron transition-all"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap gap-2 mb-10 pb-4 overflow-x-auto no-scrollbar justify-center md:justify-start">
                <AnimatePresence>
                    {availableCategories.map((cat, i) => (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${selectedCategory === cat
                                ? 'bg-brand-saffron text-white border-brand-saffron shadow-lg shadow-brand-saffron/20 scale-105'
                                : 'bg-white text-muted-foreground border-border hover:border-brand-saffron/50 hover:text-brand-saffron hover:bg-orange-50'
                                }`}
                        >
                            {cat}
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse border border-border/50" />
                    ))}
                </div>
            ) : filteredSchemes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredSchemes.map((scheme, i) => (
                            <motion.div
                                key={scheme.scheme_id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                            >
                                <SchemeCard scheme={scheme} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-20 flex flex-col items-center">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Filter className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Schemes Found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        We couldn't find any schemes matching "{search}" in {selectedCategory}. Try adjusting your filters.
                    </p>
                    <Button
                        variant="link"
                        onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                        className="mt-4 text-brand-saffron"
                    >
                        Clear all filters
                    </Button>
                </div>
            )}
        </div>
    );
}
