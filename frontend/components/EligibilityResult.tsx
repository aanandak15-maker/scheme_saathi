
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
    CheckCircle2, XCircle, FileText, Lightbulb, Upload,
    Printer, Share2, Languages, ExternalLink, AlertTriangle,
    FileWarning, MessageCircle, ArrowRight
} from 'lucide-react';
import { EligibilityResult } from '@/types';

interface EligibilityResultProps {
    result: EligibilityResult;
}

export const EligibilityResultView: React.FC<EligibilityResultProps> = ({ result }) => {
    const { eligible_schemes, ineligible_schemes_count, ai_insight } = result;
    const [isHindi, setIsHindi] = useState(false);

    const hasEligible = eligible_schemes.length > 0;

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        const text = `I checked my eligibility on Scheme Saathi! I am eligible for ${eligible_schemes.length} government schemes. Check yours at: ${window.location.origin}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleUploadClick = (docName: string) => {
        // Mock upload functionality for now or trigger file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) alert(`Simulated upload for ${docName}: ${file.name}`);
        };
        input.click();
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

            {/* Header / Status Banner */}
            <div className={`p-6 rounded-xl border-l-8 shadow-sm ${hasEligible ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                            {hasEligible ? <CheckCircle2 className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-red-600" />}
                            {hasEligible ? `Eligible for ${eligible_schemes.length} Schemes!` : 'No Schemes Found Yet'}
                        </h2>
                        <p className="text-gray-600 mt-2 max-w-2xl">
                            {hasEligible
                                ? "Great news! Based on your profile, you are likely eligible for the following government benefits."
                                : "Don't worry. Based on current data, you may need to update your profile or check specific criteria."}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint} className="hidden md:flex gap-2">
                            <Printer className="h-4 w-4" /> Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                            <Share2 className="h-4 w-4" /> Share
                        </Button>
                    </div>
                </div>
            </div>

            {/* AI Insight Card */}
            {ai_insight && ai_insight.explanation_english ? (
                <Card className="border-indigo-100 shadow-md bg-gradient-to-br from-white to-indigo-50/30 overflow-hidden">
                    <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pb-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <Lightbulb className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-indigo-900">AI Saathi Insight</CardTitle>
                                    <CardDescription>Personalized analysis of your profile</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsHindi(!isHindi)}
                                className="text-indigo-600 hover:bg-indigo-100 gap-2"
                            >
                                <Languages className="h-4 w-4" />
                                {isHindi ? 'Read in English' : 'हिंदी में पढ़ें'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 grid gap-6 md:grid-cols-3">
                        {/* Explanation */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                                <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    {isHindi ? 'विश्लेषण (Analysis)' : 'Analysis'}
                                </h4>
                                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                                    {isHindi ? ai_insight.explanation_hindi : ai_insight.explanation_english}
                                </p>
                            </div>

                            {/* Action Steps */}
                            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                    <ArrowRight className="h-4 w-4" /> Next Steps
                                </h4>
                                <ul className="space-y-2">
                                    {ai_insight.action_steps.map((step, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-gray-700 items-start">
                                            <span className="bg-blue-100 text-blue-700 h-5 w-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Sidebar: Docs & Help */}
                        <div className="space-y-4">
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                                    <FileWarning className="h-4 w-4" /> Document Guidance
                                </h4>
                                <p className="text-sm text-gray-700 mb-3">
                                    {ai_insight.document_guidance}
                                </p>
                                <Button variant="outline" size="sm" className="w-full border-orange-200 text-orange-700 hover:bg-orange-100">
                                    View Checklist
                                </Button>
                            </div>

                            <Card className="bg-white border-dashed border-2 border-gray-200 shadow-none">
                                <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                                    <div className="bg-gray-100 p-3 rounded-full">
                                        <ExternalLink className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Need Help Applying?</p>
                                        <p className="text-xs text-gray-500">Visit your nearest CSC Center</p>
                                    </div>
                                    <Button className="w-full text-xs" variant="secondary" onClick={() => window.open('https://locator.csccloud.in/', '_blank')}>
                                        Find CSC Center
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                /* Fallback for when AI service is unavailable */
                <Card className="border-gray-200 shadow-sm bg-gray-50">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="bg-gray-200 p-2 rounded-lg">
                            <Lightbulb className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-gray-700">AI Insight Unavailable</CardTitle>
                            <CardDescription>Standard eligibility checks are complete, but personalized AI advice is currently offline.</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            )}

            {/* Eligible Schemes Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        Eligible Schemes <Badge className="bg-indigo-600 text-white hover:bg-indigo-700">{eligible_schemes.length}</Badge>
                    </h3>
                    {ineligible_schemes_count > 0 && (
                        <span className="text-sm text-gray-500">
                            ({ineligible_schemes_count} other schemes checked but not eligible)
                        </span>
                    )}
                </div>

                {eligible_schemes.length === 0 ? (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>No eligible schemes found</AlertTitle>
                        <AlertDescription>
                            Try updating your profile with more details (e.g., land ownership, exact income) to find matching schemes.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Accordion type="single" collapsible className="space-y-4">
                        {eligible_schemes.map((scheme, index) => (
                            <AccordionItem key={scheme.scheme_id} value={scheme.scheme_id} className="border rounded-xl bg-white shadow-sm px-4">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 text-left w-full pr-4">
                                        {/* Icon Placeholder */}
                                        <div className="bg-indigo-50 h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText className="h-5 w-5 text-indigo-600" />
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg text-gray-900">{scheme.scheme_name}</h4>
                                            <div className="flex gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">Government Scheme</Badge>
                                                {scheme.score > 80 && <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 text-xs">High Match</Badge>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 min-w-[140px]">
                                            <div className="flex flex-col items-end w-full">
                                                <div className="flex justify-between w-full text-xs mb-1">
                                                    <span className="text-gray-500">Eligibility</span>
                                                    <span className="font-bold text-indigo-600">{scheme.score}%</span>
                                                </div>
                                                <Progress value={scheme.score} className="h-2 w-full" />
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-6 border-t">
                                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                                        <div className="space-y-4">
                                            <div>
                                                <h5 className="font-semibold text-sm mb-2 text-gray-700">Why are you eligible?</h5>
                                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
                                                    {scheme.reasoning}
                                                </p>
                                            </div>

                                            {/* Benefits Mockup - Should come from scheme data ideally */}
                                            <div>
                                                <h5 className="font-semibold text-sm mb-2 text-gray-700">Benefits</h5>
                                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                                    <li>Financial assistance</li>
                                                    <li>Direct Benefit Transfer (DBT)</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {scheme.missing_documents && scheme.missing_documents.length > 0 ? (
                                                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                                    <h5 className="font-semibold text-sm mb-3 text-red-800 flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4" /> Missing Documents
                                                    </h5>
                                                    <div className="space-y-3">
                                                        {scheme.missing_documents.map((doc, i) => (
                                                            <div key={i} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-red-100">
                                                                <span className="text-gray-700 font-medium">{doc}</span>
                                                                <Button
                                                                    size="sm" variant="outline"
                                                                    className="h-8 text-xs gap-1 hover:bg-red-50"
                                                                    onClick={() => handleUploadClick(doc)}
                                                                >
                                                                    <Upload className="h-3 w-3" /> Upload
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                                    <h5 className="font-semibold text-sm mb-2 text-green-800 flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4" /> Documents Ready
                                                    </h5>
                                                    <p className="text-sm text-green-700">
                                                        You seem to have all commonly required documents based on your profile.
                                                    </p>
                                                </div>
                                            )}

                                            <Button
                                                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                                                onClick={() => window.open(`/schemes/${scheme.scheme_id}`, '_blank')}
                                            >
                                                View Details & Apply <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>

            {/* Ineligible / Alternative Schemes Section - Collapsed by default */}
            {result.ineligible_schemes_count > 0 && (
                <div className="pt-8 border-t">
                    <p className="text-center text-sm text-gray-500">
                        {result.ineligible_schemes_count} other schemes were checked.
                        <Button variant="link" className="text-indigo-600 h-auto p-0 ml-1">View criteria to qualify</Button>.
                    </p>
                </div>
            )}

        </div>
    );
};
