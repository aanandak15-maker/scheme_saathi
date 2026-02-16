import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast"

interface CitizenSearchProps {
    onCitizenSelect: (citizenId: string) => void;
}

export function CitizenSearch({ onCitizenSelect }: CitizenSearchProps) {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('phone');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            // Use the unified search endpoint
            const results = await api.searchCitizens(query, searchType);

            if (results && results.length > 0) {
                const citizen = results[0];
                toast({
                    title: "Citizen Found",
                    description: `Found ${citizen.full_name} (${citizen.location?.district || 'Rural'})`,
                });
                onCitizenSelect(citizen.citizen_id);
            } else {
                toast({
                    variant: "destructive",
                    title: "Not Found",
                    description: `No citizen found matching this ${searchType}.`,
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to search citizen. Check backend connection.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-border/60 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Find Citizen
                {loading && <Loader2 className="h-4 w-4 animate-spin text-brand-saffron" />}
            </h3>
            <div className="flex w-full items-center space-x-2">
                <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="aadhaar">Aadhaar</SelectItem>
                    </SelectContent>
                </Select>
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder={searchType === 'phone' ? "+12397347677" : `Search by ${searchType}...`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pr-10"
                        disabled={loading}
                    />
                    <Button
                        type="button"
                        onClick={handleSearch}
                        size="icon"
                        disabled={loading}
                        className="absolute right-0 top-0 h-full rounded-l-none bg-brand-teal hover:bg-brand-teal/90 text-white"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Enter phone number (e.g. +12397347677) to search.
            </p>
        </div>
    );
}
