import os

file_path = os.path.join('..', 'src', 'pages', 'admin', 'Subscriptions.tsx')

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update loadSubscriptions to attempt business join
# Note: subscriptions table may not have an explicit foreign key to businesses, 
# but they share user_id. We'll try to fetch businesses matching user_id.
# Alternatively, we can just fetch all businesses and map them.

old_load = """    const loadSubscriptions = async () => {
        setLoading(true);

        // Get all subscriptions with user info
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            toast({
                title: "Error loading subscriptions",
                description: error.message,
                variant: "destructive"
            });
            setLoading(false);
            return;
        }

        setSubscriptions(data || []);
        setLoading(false);
    };"""

new_load = """    const loadSubscriptions = async () => {
        setLoading(true);

        // Get all subscriptions
        const { data: subs, error: subsError } = await supabase
            .from('subscriptions')
            .select('*')
            .order('updated_at', { ascending: false });

        // Get all businesses for mapping names
        const { data: businesses } = await supabase
            .from('businesses')
            .select('name, owner_user_id');

        if (subsError) {
            toast({
                title: "Error loading subscriptions",
                description: subsError.message,
                variant: "destructive"
            });
            setLoading(false);
            return;
        }

        // Map business names to subscriptions
        const mappedSubs = (subs || []).map(sub => {
            const biz = businesses?.find(b => b.owner_user_id === sub.user_id);
            return {
                ...sub,
                user_email: biz?.name || sub.user_id.substring(0, 8) // Fallback to ID
            };
        });

        setSubscriptions(mappedSubs);
        setLoading(false);
    };"""

content = content.replace(old_load, new_load)

# 2. Update Table Header
old_table_head = """                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>"""

new_table_head = """                        <TableRow>
                            <TableHead>Business/User</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Stripe IDs</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>"""

content = content.replace(old_table_head, new_table_head)

# 3. Update Table Row
# Note: Using any here to bypass interface issues in the script-based edit
old_row = """                                <TableRow key={sub.id}>
                                    <TableCell className="font-mono text-xs">
                                        {sub.user_id.substring(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {sub.plan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(sub.status, sub.subscription_expires_at)}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(sub.subscription_expires_at)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(sub.updated_at).toLocaleDateString('en-GB')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleMarkAsPaid(sub.user_id, 'professional')}
                                            >
                                                +30 Days
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-emerald-500 hover:bg-emerald-600"
                                                onClick={() => handleMarkAsPaid(sub.user_id, 'enterprise')}
                                            >
                                                +1 Year
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>"""

new_row = """                                <TableRow key={sub.id}>
                                    <TableCell>
                                        <div className="font-medium text-sm text-foreground truncate max-w-[150px]">
                                            {(sub as any).user_email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize ${sub.plan === 'enterprise' ? 'border-emerald-500 text-emerald-500' : sub.plan === 'professional' ? 'border-gold text-gold' : ''}`}>
                                            {sub.plan === 'enterprise' ? 'Pro Yearly' : sub.plan === 'professional' ? 'Pro Monthly' : sub.plan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(sub.status, sub.subscription_expires_at)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-[10px] font-mono text-muted-foreground">
                                            {(sub as any).payment_customer_id && <div className="truncate w-24">CUS: {(sub as any).payment_customer_id}</div>}
                                            {(sub as any).payment_subscription_id && <div className="truncate w-24">SUB: {(sub as any).payment_subscription_id}</div>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(sub.subscription_expires_at)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs"
                                                onClick={() => handleMarkAsPaid(sub.user_id, 'professional')}
                                            >
                                                +30d
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600"
                                                onClick={() => handleMarkAsPaid(sub.user_id, 'enterprise')}
                                            >
                                                +1y
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>"""

content = content.replace(old_row, new_row)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated Subscriptions.tsx")
