const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/BlogPostPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = '<ReactMarkdown';
const componentsStartStr = 'components={{';

const index = content.indexOf(targetStr);
const componentsIndex = content.indexOf(componentsStartStr, index);

if (index !== -1 && componentsIndex !== -1) {
    // Find the end of components object
    let openBraces = 0;
    let endIndex = -1;
    for (let i = componentsIndex + 12; i < content.length; i++) {
        if (content[i] === '{') openBraces++;
        if (content[i] === '}') {
            if (openBraces === 0) {
                endIndex = i + 1;
                break;
            }
            openBraces--;
        }
    }

    if (endIndex !== -1) {
        const replacement = `components={{
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
        
        content = content.slice(0, componentsIndex) + replacement + content.slice(endIndex);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully updated BlogPostPage.tsx');
    } else {
        console.error('Could not find end of components object');
    }
} else {
    console.error('Target not found');
}
