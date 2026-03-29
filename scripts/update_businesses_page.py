import os

file_path = os.path.join('..', 'src', 'pages', 'admin', 'Businesses.tsx')

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update loadBusinesses to fetch subscriptions as well
old_load = """    async function loadBusinesses() {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('businesses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading businesses:', error);
            toast({
                title: "Error",
                description: "Failed to load businesses",
                variant: "destructive",
            });
        } else {
            setBusinesses(data || []);
        }
        setIsLoading(false);
    }"""

new_load = """    async function loadBusinesses() {
        setIsLoading(true);
        // Fetch businesses
        const { data: bizData, error } = await supabase
            .from('businesses')
            .select('*')
            .order('created_at', { ascending: false });

        // Fetch active subscriptions
        const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id, plan, status')
            .eq('status', 'active');

        if (error) {
            console.error('Error loading businesses:', error);
            toast({
                title: "Error",
                description: "Failed to load businesses",
                variant: "destructive",
            });
        } else {
            // Merge premium status
            const merged = (bizData || []).map(biz => ({
                ...biz,
                is_premium: subData?.some(s => s.user_id === biz.owner_user_id)
            }));
            setBusinesses(merged);
        }
        setIsLoading(false);
    }"""

content = content.replace(old_load, new_load)

# 2. Update Table Row to show Premium Badge
old_name_cell = """                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium">{business.name}</div>
                                            <div className="text-sm text-muted-foreground">{business.phone}</div>
                                        </div>
                                    </td>"""

new_name_cell = """                                    <td className="p-4">
                                        <div className="flex items-start gap-2">
                                            <div>
                                                <div className="font-medium flex items-center gap-2">
                                                    {business.name}
                                                    {business.is_premium && (
                                                        <span className="bg-gold/10 text-gold text-[10px] px-1.5 py-0.5 rounded border border-gold/20 font-bold uppercase">
                                                            PRO
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{business.phone}</div>
                                            </div>
                                        </div>
                                    </td>"""

content = content.replace(old_name_cell, new_name_cell)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated Businesses.tsx")
