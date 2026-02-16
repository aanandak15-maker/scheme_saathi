"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Scheme } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, ExternalLink, FileText, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SchemeDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [scheme, setScheme] = useState<Scheme | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        // Handle array or string id
        const schemeId = Array.isArray(id) ? id[0] : id;

        api.getSchemeById(schemeId)
            .then(data => {
                setScheme(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load scheme details.');
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-saffron"></div>
            </div>
        );
    }

    if (error || !scheme) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Scheme Not Found</h2>
                <p className="text-gray-500 mb-6">{error || "The requested scheme does not exist."}</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Button
                variant="ghost"
                className="mb-6 pl-0 hover:bg-transparent hover:text-brand-saffron"
                onClick={() => router.back()}
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Schemes
            </Button>

            <div className="bg-white rounded-2xl shadow-sm border border-border/60 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-50 to-white p-8 border-b border-border/40">
                    <div className="flex gap-2 mb-4">
                        <Badge className="bg-brand-saffron/10 text-brand-saffron hover:bg-brand-saffron/20 border-brand-saffron/20">
                            {scheme.category}
                        </Badge>
                        {scheme.subcategory && (
                            <Badge variant="outline" className="text-gray-500">
                                {scheme.subcategory}
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {scheme.scheme_name}
                    </h1>
                    {scheme.scheme_name_hindi && (
                        <h2 className="text-xl text-gray-600 font-medium font-hindi">
                            {scheme.scheme_name_hindi}
                        </h2>
                    )}
                </div>

                <div className="p-8 space-y-8">
                    {/* Overview */}
                    <section>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-brand-teal">
                            <Info className="h-5 w-5" /> Overview
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            {scheme.description}
                        </p>
                    </section>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Benefits */}
                        <section className="bg-green-50/50 p-6 rounded-xl border border-green-100">
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-green-700">
                                <CheckCircle className="h-5 w-5" /> Benefits
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-green-100 last:border-0">
                                    <span className="text-gray-600">Benefit Type</span>
                                    <span className="font-medium text-gray-900">{scheme.benefit_type}</span>
                                </div>
                                {scheme.benefit_amount && (
                                    <div className="flex justify-between items-center py-2 border-b border-green-100 last:border-0">
                                        <span className="text-gray-600">Amount</span>
                                        <span className="font-medium text-gray-900">{scheme.benefit_amount}</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Documents */}
                        <section className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-blue-700">
                                <FileText className="h-5 w-5" /> Required Documents
                            </h3>
                            <ul className="space-y-2">
                                {scheme.required_documents?.map((doc, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                                        <div className={`h-1.5 w-1.5 rounded-full ${doc.mandatory ? 'bg-red-400' : 'bg-blue-400'}`} />
                                        <span>{doc.doc_name} {doc.mandatory && <span className="text-xs text-red-500 font-medium">(Mandatory)</span>}</span>
                                    </li>
                                )) || (
                                        <li className="text-sm text-gray-500 italic">No specific documents listed.</li>
                                    )}
                            </ul>
                        </section>
                    </div>

                    {/* How to Apply */}
                    {scheme.application_process && (
                        <section className="bg-orange-50/50 p-6 rounded-xl border border-orange-100">
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-orange-800">
                                <ExternalLink className="h-5 w-5" /> Application Process
                            </h3>
                            <div className="grid md:grid-cols-1 gap-4">
                                <div className="flex flex-col gap-4">
                                    {scheme.application_process.steps.map((step, i) => (
                                        <div key={i} className="flex gap-4 items-start">
                                            <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold flex-shrink-0 text-sm">
                                                {i + 1}
                                            </div>
                                            <p className="text-gray-700 mt-1">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-saffron hover:bg-brand-saffron/90 text-white gap-2"
                            disabled={!scheme.application_process?.portal_url}
                        >
                            {scheme.application_process?.portal_url ? (
                                <a href={scheme.application_process.portal_url} target="_blank" rel="noopener noreferrer">
                                    Apply Now <ExternalLink className="h-4 w-4" />
                                </a>
                            ) : (
                                <span>Apply Now <ExternalLink className="h-4 w-4" /></span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
