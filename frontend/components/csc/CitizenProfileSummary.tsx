import React from 'react';
import { CitizenProfile } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Briefcase, Calendar, CheckCircle2, DollarSign } from 'lucide-react';

interface CitizenProfileSummaryProps {
    profile: CitizenProfile;
}

export const CitizenProfileSummary: React.FC<CitizenProfileSummaryProps> = ({ profile }) => {
    return (
        <Card className="border-border/60 shadow-md bg-white overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-saffron to-brand-teal"></div>

            <CardHeader className="pb-4 bg-gray-50/50 border-b border-gray-100 flex flex-row items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-saffron/20 to-brand-teal/20 flex items-center justify-center border-2 border-white shadow-sm">
                    <User className="h-8 w-8 text-brand-teal" />
                </div>
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        {profile.full_name}
                        <CheckCircle2 className="h-5 w-5 text-brand-teal fill-teal-100" />
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-mono mt-1">ID: {profile.citizen_id || 'N/A'}</p>
                </div>
                <div className="ml-auto">
                    <Badge variant="outline" className={`
                        ${profile.caste_category === 'General' ? 'border-gray-300 text-gray-600' :
                            profile.caste_category === 'SC' || profile.caste_category === 'ST' ? 'border-brand-saffron text-brand-saffron bg-orange-50' :
                                'border-blue-300 text-blue-600 bg-blue-50'}
                     `}>
                        {profile.caste_category}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-6 grid grid-cols-2 gap-y-4 gap-x-6">
                <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Age & Gender</p>
                        <p className="font-medium">{profile.age} Years, {profile.gender}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Location</p>
                        <p className="font-medium">{profile.location.district}, {profile.location.state}</p>
                        <p className="text-xs text-muted-foreground">({profile.location.residence_type})</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Occupation</p>
                        <p className="font-medium">{profile.occupation.primary_occupation}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Income Status</p>
                        <p className="font-medium">{(profile.occupation as any).income_level || (profile.occupation as any).monthly_income || 'Not Specified'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
