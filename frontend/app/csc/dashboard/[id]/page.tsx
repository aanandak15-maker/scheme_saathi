"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CSCDashboard } from "@/components/csc/CSCDashboard";
import { api } from '@/lib/api';
import { CitizenProfile, EligibilityResult } from '@/types';
import { Loader2 } from 'lucide-react';

export default function CitizenDashboardPage() {
    const { id } = useParams();
    const citizenId = Array.isArray(id) ? id[0] : id;
    const [citizen, setCitizen] = useState<CitizenProfile | null>(null);
    const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!citizenId) return;

        const loadData = async () => {
            try {
                const citizenData = await api.getCitizenById(citizenId);
                if (citizenData) {
                    setCitizen(citizenData);
                    const eligibility = await api.checkEligibility(citizenData);
                    setEligibilityResult(eligibility);
                }
            } catch (error) {
                console.error("Failed to load citizen data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [citizenId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-brand-teal" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <CSCDashboard initialCitizen={citizen} initialEligibility={eligibilityResult} />
        </div>
    );
}
