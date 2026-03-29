const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/BlogPostPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `                        components={{
                            img: ({ node, alt, ...props }) => (
                                <figure className="not-prose my-12 md:my-16 block">
                                    <div className="overflow-hidden rounded-xl shadow-md border border-border/50">
                                        <img
                                            {...props}
                                            alt={alt}
                                            className="w-full h-auto object-cover block"
                                            loading="lazy"
                                        />
                                    </div>
                                    {alt && (
                                        <figcaption className="mt-3 text-center text-sm text-muted-foreground italic">
                                            {alt}
                                        </figcaption>
                                    )}
                                </figure>
                            ),
                        }}`;

const replacement = `                        components={{
                            img: ({ node, alt, ...props }) => (
                                <figure className="not-prose my-12 md:my-16 block">
                                    <div className="overflow-hidden rounded-xl shadow-md border border-border/50">
                                        <img
                                            {...props}
                                            alt={alt}
                                            className="w-full h-auto object-cover block"
                                            loading="lazy"
                                        />
                                    </div>
                                    {alt && (
                                        <figcaption className="mt-3 text-center text-sm text-muted-foreground italic">
                                            {alt}
                                        </figcaption>
                                    )}
                                </figure>
                            ),
                            a: ({ node, ...props }) => {
                                const isAmazon = props.href?.includes('amazon.co.uk') || props.children?.toString().includes('Order');
                                if (isAmazon) {
                                    return (
                                        <div className="my-12 flex justify-center">
                                            <Button 
                                                asChild 
                                                className="bg-[#FF9900] hover:bg-[#FF8800] text-black font-bold py-8 px-16 rounded-xl shadow-xl transform transition hover:scale-105 active:scale-95 text-2xl h-auto whitespace-normal text-center min-h-[80px]"
                                            >
                                                <a {...props} target="_blank" rel="noopener noreferrer">
                                                    {props.children}
                                                </a>
                                            </Button>
                                        </div>
                                    );
                                }
                                return <a {...props} className="text-primary hover:underline" />;
                            },
                        }}`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated BlogPostPage.tsx');
} else {
    console.error('Target content not found in BlogPostPage.tsx. Please check the file structure.');
    // Fallback: try to find a simpler version of the target or log more info
    console.log('File length:', content.length);
}
