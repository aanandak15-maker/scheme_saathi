import React from 'react';
import { Scheme } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge as UiBadge } from '@/components/ui/badge';
import { ArrowRight, Wallet, Sprout, Home, GraduationCap, HeartPulse, Briefcase, Users, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface SchemeCardProps {
    scheme: Scheme;
}

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'Agriculture': return <Sprout className="h-5 w-5" />;
        case 'Housing': return <Home className="h-5 w-5" />;
        case 'Education': return <GraduationCap className="h-5 w-5" />;
        case 'Health': return <HeartPulse className="h-5 w-5" />;
        case 'Business': return <Briefcase className="h-5 w-5" />;
        case 'Social Welfare': return <Users className="h-5 w-5" />;
        default: return <HelpCircle className="h-5 w-5" />;
    }
};

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'Agriculture': return 'bg-green-500';
        case 'Housing': return 'bg-orange-500';
        case 'Education': return 'bg-blue-500';
        case 'Health': return 'bg-red-500';
        case 'Business': return 'bg-purple-500';
        case 'Social Welfare': return 'bg-pink-500';
        default: return 'bg-gray-500';
    }
};

export const SchemeCard: React.FC<SchemeCardProps> = ({ scheme }) => {
    const categoryColor = getCategoryColor(scheme.category);

    return (
        <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 group relative bg-white">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${categoryColor}`}></div>

            <CardHeader className="pb-3 pl-6">
                <div className="flex justify-between items-start gap-4">
                    <UiBadge variant="secondary" className="mb-2 bg-gray-100 text-gray-600 hover:bg-gray-200">
                        {scheme.category}
                    </UiBadge>
                    <div className={`p-2 rounded-full bg-opacity-10 ${categoryColor.replace('bg-', 'text-').replace('500', '600')} ${categoryColor.replace('bg-', 'bg-')}/10`}>
                        {getCategoryIcon(scheme.category)}
                    </div>
                </div>
                <CardTitle className="text-xl font-bold leading-tight group-hover:text-brand-teal transition-colors line-clamp-2">
                    {scheme.scheme_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium">{scheme.scheme_name_hindi}</p>
            </CardHeader>

            <CardContent className="flex-grow pl-6 py-2 space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {scheme.description || `Comprehensive support scheme under ${scheme.category} sector designed to provide financial and technical assistance to eligible citizens.`}
                </p>

                {scheme.benefit_amount && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                            <Wallet className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Benefit</p>
                            <p className="text-sm font-bold text-green-800">{scheme.benefit_amount}</p>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-4 pb-6 pl-6 bg-gray-50/50 mt-auto border-t border-gray-100">
                <Link href={`/schemes/${scheme.scheme_id}`} className="w-full">
                    <Button className="w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-brand-saffron hover:text-brand-saffron group-hover:shadow-md transition-all justify-between">
                        View Details <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
};
