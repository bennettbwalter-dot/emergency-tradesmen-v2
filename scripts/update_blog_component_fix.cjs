const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/BlogPostPageFix.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Related Posts logic to be more unique (avoid duplicates)
// We'll change the query to be more specific and maybe filter manually if needed.
// But first, let's fix the Amazon button in the markdown component.

const amazonButtonCode = `                                                            a: ({ node, ...props }) => {
                                                                const href = props.href || '';
                                                                const childrenText = props.children?.toString() || '';
                                                                const isAmazon = href.includes('amazon.co.uk') || 
                                                                               href.includes('amazon.com') || 
                                                                               childrenText.toLowerCase().includes('order') ||
                                                                               childrenText.toLowerCase().includes('amazon');
                                                                               
                                                                if (isAmazon) {
                                                                    return (
                                                                        <div className="my-12 flex justify-center">
                                                                            <Button 
                                                                                asChild 
                                                                                className="bg-[#FF9900] hover:bg-[#FF8800] text-black font-bold py-8 px-16 rounded-xl shadow-xl transform transition hover:scale-105 active:scale-95 text-2xl h-auto whitespace-normal text-center min-h-[80px] w-full max-w-2xl"
                                                                            >
                                                                                <a {...props} target="_blank" rel="noopener noreferrer">
                                                                                    {props.children}
                                                                                </a>
                                                                            </Button>
                                                                        </div>
                                                                    );
                                                                }

                                                                const isInternal = props.href?.includes('emergencytradesmen.net');
                                                                return (
                                                                    <a
                                                                        {...props}
                                                                        className={\`font-semibold text-gold no-underline hover:underline \${isInternal ? 'decoration-gold/30 underline-offset-4' : ''}\`}
                                                                    >
                                                                        {props.children}
                                                                        {isInternal && <ChevronRight className="inline-block w-4 h-4 ml-0.5" />}
                                                                    </a>
                                                                );
                                                            },`;

// Find the existing 'a' renderer (around line 668)
const aRendererStart = content.indexOf('a: ({ node, ...props }) => {');
const aRendererEnd = content.indexOf('},', aRendererStart) + 2;

if (aRendererStart !== -1) {
    content = content.slice(0, aRendererStart) + amazonButtonCode + content.slice(aRendererEnd);
    console.log('Successfully injected Amazon button logic into BlogPostPageFix.tsx');
} else {
    console.error('Could not find a: renderer');
}

// 2. Fix duplicate Related Articles
// Line ~270: query = supabase...
const loadRelatedStart = content.indexOf('async function loadRelated() {');
const loadRelatedEnd = content.indexOf('loadRelated();', loadRelatedStart);

// We'll change the setRelatedPosts to filter by title uniqueness
const relatedFix = `    useEffect(() => {
        async function loadRelated() {
            if (!post) return;
            let query = supabase
                .from('posts')
                .select('id, title, slug, cover_image, excerpt, published_at')
                .eq('published', true)
                .neq('slug', post.slug)
                .order('published_at', { ascending: false });

            if (settings.countryCode === 'US') {
                query = query.ilike('slug', '%-us');
            } else {
                query = query.not('slug', 'ilike', '%-us');
            }

            const { data } = await query;
            if (data) {
                // Manually filter unique titles and limit to 3
                const uniquePosts: any[] = [];
                const seenTitles = new Set();
                
                for (const p of data) {
                    const normalizedTitle = p.title.toLowerCase().trim();
                    if (!seenTitles.has(normalizedTitle) && uniquePosts.length < 3) {
                        seenTitles.add(normalizedTitle);
                        uniquePosts.push(p);
                    }
                }
                setRelatedPosts(uniquePosts);
            }
        }
        loadRelated();
    }, [post?.slug, settings.countryCode]);`;

const useEffectStart = content.indexOf('useEffect(() => {', loadRelatedStart - 100);
const useEffectEnd = content.indexOf('}, [post?.slug, settings.countryCode]);') + '}, [post?.slug, settings.countryCode]);'.length;

if (useEffectStart !== -1 && useEffectEnd !== -1) {
    content = content.slice(0, useEffectStart) + relatedFix + content.slice(useEffectEnd);
    console.log('Successfully fixed Related Posts duplication logic');
}

fs.writeFileSync(filePath, content, 'utf8');
