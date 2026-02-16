
"use client"
import React, { useState } from 'react';
import { VoiceInput } from '@/components/VoiceInput';
import { EligibilityResultView } from '@/components/EligibilityResult';
import { api } from '@/lib/api';
import { CitizenProfile, EligibilityResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, ClipboardList, ArrowRight, ArrowLeft,
    CheckCircle2, MapPin, User, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import { Progress } from "@/components/ui/progress"

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal"
];

const OCCUPATIONS = [
    "Farmer", "Student", "Construction Worker", "Unemployed", "Street Vendor",
    "Teacher", "Small Business Owner", "Driver", "Artisan/Weaver", "Fisherman",
    "Dairy Worker", "Factory Worker", "Sanitation Worker", "Domestic Worker", "Other"
];

export default function CheckEligibilityPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<EligibilityResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [activeTab, setActiveTab] = useState("form");

    const [formData, setFormData] = useState<Partial<CitizenProfile>>({
        full_name: '',
        age: undefined,
        location: { state: '', district: '', residence_type: 'Rural' },
        occupation: { primary_occupation: '', income_level: '' },
        caste_category: 'General',
        gender: 'Male'
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const validateStep = (currentStep: number) => {
        const errors: Record<string, string> = {};
        let isValid = true;

        if (currentStep === 1) {
            if (!formData.full_name?.trim()) errors.full_name = "Name is required";
            if (!formData.age || formData.age < 15 || formData.age > 100) errors.age = "Valid age (15-100) required";
            if (!formData.gender) errors.gender = "Gender is required";
        }
        else if (currentStep === 2) {
            if (!formData.location?.state) errors.state = "State is required";
            if (!formData.location?.district?.trim()) errors.district = "District is required";
        }
        else if (currentStep === 3) {
            if (!formData.occupation?.primary_occupation) errors.occupation = "Occupation is required";
            if (!formData.caste_category) errors.category = "Category is required";
        }

        setValidationErrors(errors);
        isValid = Object.keys(errors).length === 0;
        return isValid;
    };

    const handleVoiceTranscript = (text: string) => {
        if (text.toLowerCase().includes("farmer")) {
            setFormData(prev => ({
                ...prev,
                occupation: { ...prev.occupation!, primary_occupation: "Farmer" }
            }));
        }
    };

    const handleCheckEligibility = async () => {
        if (!validateStep(3)) return;

        setLoading(true);
        setError(null);
        try {
            const profile: CitizenProfile = {
                full_name: formData.full_name!,
                age: Number(formData.age),
                gender: formData.gender as any,
                location: formData.location as any,
                occupation: formData.occupation as any,
                caste_category: formData.caste_category!,
                marital_status: 'Single',
                disability_status: 'None',
                is_student: false,
                education_level: 'High School',
                employment_status: 'Employed'
            };

            const res = await api.checkEligibility(profile);
            setResult(res);
        } catch (err) {
            console.error("Eligibility check failed", err);
            setError("Unable to connect to Scheme Saathi AI. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(s => Math.min(s + 1, 3));
        }
    };

    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    if (result) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Button variant="ghost" onClick={() => setResult(null)} className="mb-4 gap-2 hover:bg-brand-saffron/10 hover:text-brand-saffron">
                    <ArrowLeft className="h-4 w-4" /> Check Another
                </Button>
                <EligibilityResultView result={result} />
            </div>
        )
    }

    const progressValue = (step / 3) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-teal-50/50 py-12 px-4 flex flex-col items-center">
            <div className="text-center mb-10 space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="inline-flex items-center justify-center p-2 rounded-full bg-brand-saffron/10 text-brand-saffron mb-2">
                    <Sparkles className="h-5 w-5" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                    Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-saffron to-brand-teal">Schemes</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Tell us a bit about yourself, and our AI will find the best government benefits matching your profile.
                </p>
            </div>

            <Card className="max-w-3xl w-full shadow-xl border-border/40 bg-white/90 backdrop-blur-md overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-saffron/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-teal/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="border-b border-border/50 px-6 pt-4">
                        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-gray-100/80 p-1 rounded-full">
                            <TabsTrigger value="form" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-brand-teal data-[state=active]:shadow-sm transition-all duration-300">
                                <ClipboardList className="h-4 w-4 mr-2" /> Wizard Mode
                            </TabsTrigger>
                            <TabsTrigger value="voice" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-brand-saffron data-[state=active]:shadow-sm transition-all duration-300">
                                <Mic className="h-4 w-4 mr-2" /> Voice Mode
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <CardContent className="p-0">
                        <AnimatePresence mode="wait">
                            {activeTab === 'voice' ? (
                                <motion.div
                                    key="voice"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <TabsContent value="voice" className="flex flex-col items-center py-16 space-y-8 m-0 min-h-[450px] justify-center text-center px-6">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-brand-saffron/20 rounded-full blur-xl animate-pulse" />
                                            <VoiceInput onTranscript={handleVoiceTranscript} />
                                        </div>
                                        <div className="space-y-3 max-w-md">
                                            <h3 className="text-lg font-semibold text-gray-900">Speak to AI Saathi</h3>
                                            <p className="text-muted-foreground">
                                                Tap the mic and say something like:
                                            </p>
                                            <p className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 italic">
                                                "My name is Ramesh, I am a 45 year old farmer from Bihar living in a rural area."
                                            </p>
                                        </div>
                                    </TabsContent>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <TabsContent value="form" className="p-8 m-0 min-h-[450px] flex flex-col">
                                        {/* Progress Bar */}
                                        <div className="mb-8 space-y-2">
                                            <div className="flex justify-between text-sm font-medium text-muted-foreground">
                                                <span className={step >= 1 ? "text-brand-teal" : ""}>Personal</span>
                                                <span className={step >= 2 ? "text-brand-teal" : ""}>Location</span>
                                                <span className={step >= 3 ? "text-brand-teal" : ""}>Occupation</span>
                                            </div>
                                            <Progress value={progressValue} className="h-2 bg-gray-100" indicatorClassName="bg-gradient-to-r from-brand-saffron to-brand-teal" />
                                        </div>

                                        {error && (
                                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in shake">
                                                <AlertCircle className="h-5 w-5" />
                                                <span className="text-sm font-medium">{error}</span>
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <AnimatePresence mode="wait">
                                                {step === 1 && (
                                                    <motion.div
                                                        key="step1"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="space-y-6"
                                                    >
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-700">Full Name</Label>
                                                                <div className="relative group">
                                                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-brand-teal transition-colors" />
                                                                    <Input
                                                                        placeholder="Enter your full name"
                                                                        className={`pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all ${validationErrors.full_name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                                        value={formData.full_name}
                                                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                                                    />
                                                                </div>
                                                                {validationErrors.full_name && <p className="text-xs text-red-500 font-medium">{validationErrors.full_name}</p>}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <div className="space-y-2">
                                                                    <Label className="text-gray-700">Age</Label>
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="Eg. 30"
                                                                        className={`h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all ${validationErrors.age ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                                        value={formData.age || ''}
                                                                        onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                                                                    />
                                                                    {validationErrors.age && <p className="text-xs text-red-500 font-medium">{validationErrors.age}</p>}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-gray-700">Gender</Label>
                                                                    <Select onValueChange={v => setFormData({ ...formData, gender: v })} value={formData.gender}>
                                                                        <SelectTrigger className={`h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all ${validationErrors.gender ? "border-red-500" : ""}`}>
                                                                            <SelectValue placeholder="Select" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="Male">Male</SelectItem>
                                                                            <SelectItem value="Female">Female</SelectItem>
                                                                            <SelectItem value="Other">Other</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {validationErrors.gender && <p className="text-xs text-red-500 font-medium">{validationErrors.gender}</p>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {step === 2 && (
                                                    <motion.div
                                                        key="step2"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="space-y-6"
                                                    >
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-700">State</Label>
                                                                <Select onValueChange={v => setFormData({ ...formData, location: { ...formData.location!, state: v } })} value={formData.location?.state}>
                                                                    <SelectTrigger className={`h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all ${validationErrors.state ? "border-red-500" : ""}`}>
                                                                        <SelectValue placeholder="Select State" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="max-h-[200px]">
                                                                        {INDIAN_STATES.map(st => (
                                                                            <SelectItem key={st} value={st}>{st}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {validationErrors.state && <p className="text-xs text-red-500 font-medium">{validationErrors.state}</p>}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-700">District</Label>
                                                                <div className="relative group">
                                                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-brand-teal transition-colors" />
                                                                    <Input
                                                                        placeholder="Enter District"
                                                                        className={`pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all ${validationErrors.district ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                                        value={formData.location?.district}
                                                                        onChange={e => setFormData({ ...formData, location: { ...formData.location!, district: e.target.value } })}
                                                                    />
                                                                </div>
                                                                {validationErrors.district && <p className="text-xs text-red-500 font-medium">{validationErrors.district}</p>}
                                                            </div>
                                                            <div className="space-y-3">
                                                                <Label className="text-gray-700">Residence Type</Label>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div onClick={() => setFormData({ ...formData, location: { ...formData.location!, residence_type: 'Rural' } })}
                                                                        className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all duration-200 relative overflow-hidden ${formData.location?.residence_type === 'Rural' ? 'bg-brand-saffron/5 border-brand-saffron text-brand-saffron shadow-md' : 'border-gray-100 hover:border-brand-saffron/30 hover:bg-gray-50'}`}>
                                                                        <p className="font-bold">Rural</p>
                                                                        <p className="text-xs opacity-70">Village Level</p>
                                                                    </div>
                                                                    <div onClick={() => setFormData({ ...formData, location: { ...formData.location!, residence_type: 'Urban' } })}
                                                                        className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all duration-200 relative overflow-hidden ${formData.location?.residence_type === 'Urban' ? 'bg-brand-teal/5 border-brand-teal text-brand-teal shadow-md' : 'border-gray-100 hover:border-brand-teal/30 hover:bg-gray-50'}`}>
                                                                        <p className="font-bold">Urban</p>
                                                                        <p className="text-xs opacity-70">City/Town Level</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {step === 3 && (
                                                    <motion.div
                                                        key="step3"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="space-y-6"
                                                    >
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-700">Occupation</Label>
                                                                <Select onValueChange={v => setFormData({ ...formData, occupation: { ...formData.occupation!, primary_occupation: v } })} value={formData.occupation?.primary_occupation}>
                                                                    <SelectTrigger className={`h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all ${validationErrors.occupation ? "border-red-500" : ""}`}>
                                                                        <SelectValue placeholder="Select Occupation" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {OCCUPATIONS.map(occ => (
                                                                            <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {validationErrors.occupation && <p className="text-xs text-red-500 font-medium">{validationErrors.occupation}</p>}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-700">Category</Label>
                                                                <Select onValueChange={v => setFormData({ ...formData, caste_category: v })} value={formData.caste_category}>
                                                                    <SelectTrigger className={`h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all ${validationErrors.category ? "border-red-500" : ""}`}>
                                                                        <SelectValue placeholder="Select Category" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="General">General</SelectItem>
                                                                        <SelectItem value="OBC">OBC</SelectItem>
                                                                        <SelectItem value="SC">SC</SelectItem>
                                                                        <SelectItem value="ST">ST</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                {validationErrors.category && <p className="text-xs text-red-500 font-medium">{validationErrors.category}</p>}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </TabsContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>

                    <CardFooter className="flex justify-between border-t border-gray-100 p-6 bg-gray-50/50">
                        {activeTab === 'form' && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={step === 1}
                                    className="gap-2 border-gray-300 hover:bg-white hover:text-gray-900"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Back
                                </Button>
                                {step < 3 ? (
                                    <Button onClick={nextStep} className="bg-brand-teal hover:bg-brand-teal/90 text-white gap-2 shadow-lg shadow-brand-teal/20">
                                        Next Step <ArrowRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleCheckEligibility} disabled={loading} className="bg-gradient-to-r from-brand-saffron to-brand-orange hover:to-brand-saffron text-white gap-2 px-8 shadow-lg shadow-brand-saffron/25 transition-all hover:scale-105">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                        {loading ? 'Analyzing...' : 'Check Eligibility'}
                                    </Button>
                                )}
                            </>
                        )}
                        {activeTab === 'voice' && (
                            <div className="w-full text-center">
                                <Button variant="ghost" onClick={() => setActiveTab("form")} className="text-muted-foreground hover:text-brand-saffron text-sm">
                                    Switch to manual entry
                                </Button>
                            </div>
                        )}
                    </CardFooter>
                </Tabs>
            </Card>
        </div>
    );
}
