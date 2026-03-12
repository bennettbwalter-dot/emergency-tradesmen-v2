const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/BlogPostPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The ReactMarkdown section starts around line 852
const reactMarkdownStart = content.indexOf('<ReactMarkdown');
const reactMarkdownEnd = content.indexOf('</ReactMarkdown>', reactMarkdownStart) + '</ReactMarkdown>'.length;

const replacement = `                    <ReactMarkdown
                        components={{
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
                                return <a {...props} className="text-primary hover:underline" />;
                            },
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>`;

if (reactMarkdownStart !== -1 && reactMarkdownEnd !== -1) {
    const newContent = content.slice(0, reactMarkdownStart) + replacement + content.slice(reactMarkdownEnd);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Successfully fixed and cleaned up BlogPostPage.tsx');
} else {
    console.error('Could not find ReactMarkdown component');
}
