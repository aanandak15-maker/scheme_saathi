"use client"
import React, { useState } from 'react';
import { CitizenSearch } from './CitizenSearch';
import { CitizenProfileSummary } from './CitizenProfileSummary';
import { EligibleSchemesList } from './EligibleSchemesList';
import { MissingDocumentsAlert } from './MissingDocumentsAlert';
import { CitizenProfile, EligibilityResult } from '@/types';
import { LayoutDashboard, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

interface CSCDashboardProps {
    initialCitizen?: CitizenProfile | null;
    initialEligibility?: EligibilityResult | null;
}

export const CSCDashboard = ({ initialCitizen = null, initialEligibility = null }: CSCDashboardProps) => {
    // State Initialization with Optional Props
    const [selectedCitizen, setSelectedCitizen] = useState<CitizenProfile | null>(initialCitizen);
    const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(initialEligibility);

    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Reset state when initialCitizen changes (for dynamic routes)
    React.useEffect(() => {
        if (initialCitizen) setSelectedCitizen(initialCitizen);
        if (initialEligibility) setEligibilityResult(initialEligibility);
    }, [initialCitizen, initialEligibility]);

    // Real Search Handler
    const handleCitizenSelect = async (citizenId: string) => {
        setLoading(true);
        try {
            // 1. Fetch Citizen Details
            const citizen = await api.getCitizenById(citizenId);
            if (!citizen) {
                toast({ variant: "destructive", title: "Error", description: "Could not retrieve citizen details." });
                return;
            }
            setSelectedCitizen(citizen);

            // 2. Check Eligibility
            toast({ title: "Checking Eligibility...", description: "Analyzing profile against schemes." });
            const eligibility = await api.checkEligibility(citizen);
            setEligibilityResult(eligibility);

            toast({ title: "Analysis Complete", description: "Eligibility results updated." });

        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Failed to process citizen data." });
        } finally {
            setLoading(false);
        }
    };

    // Calculate all missing documents across all eligible schemes for the alert
    const allMissingDocs = eligibilityResult?.eligible_schemes.flatMap(s => s.missing_documents) || [];
    const uniqueMissingDocs = Array.from(new Set(allMissingDocs));

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-xl bg-brand-teal text-white flex items-center justify-center shadow-lg shadow-brand-teal/20">
                    <LayoutDashboard className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">CSC Agent Portal</h1>
                    <p className="text-muted-foreground">Manage citizen profiles and applications</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar / Search Column */}
                <div className="lg:col-span-4 space-y-6">
                    <CitizenSearch onCitizenSelect={handleCitizenSelect} />

                    {selectedCitizen && (
                        <div className="animate-in slide-in-from-left-4 duration-500">
                            <CitizenProfileSummary profile={selectedCitizen} />
                        </div>
                    )}
                </div>

                {/* Right Content Column */}
                <div className="lg:col-span-8 space-y-6">
                    {!selectedCitizen ? (
                        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl h-[400px] flex flex-col items-center justify-center text-center p-8">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                <LayoutDashboard className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Citizen Selected</h3>
                            <p className="text-gray-500 max-w-sm">Use the search box on the left to find a citizen by their Aadhaar number, Phone, or Name.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {uniqueMissingDocs.length > 0 && (
                                <MissingDocumentsAlert missingDocuments={uniqueMissingDocs} />
                            )}

                            {eligibilityResult?.eligible_schemes && (
                                <EligibleSchemesList schemes={eligibilityResult.eligible_schemes} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
