const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/BlogPostPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The replacement logic to make it more robust
const replacement = `                            a: ({ node, ...props }) => {
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
                            },`;

// Find where the 'a:' component is defined or should be added
if (content.includes('a: ({ node, ...props }) => {')) {
    // Replace existing 'a' component
    const startPattern = 'a: ({ node, ...props }) => {';
    const startIndex = content.indexOf(startPattern);
    
    // Find matching end brace for the function
    let braces = 0;
    let endIndex = -1;
    for (let i = startIndex; i < content.length; i++) {
        if (content[i] === '{') braces++;
        if (content[i] === '}') {
            braces--;
            if (braces === 0) {
                endIndex = i + 1;
                // If the next char is a comma, include it
                if (content[endIndex] === ',') endIndex++;
                break;
            }
        }
    }
    
    if (endIndex !== -1) {
        content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully updated BlogPostPage.tsx with robust detection');
    }
} else {
    console.error('Could not find existing a: component to replace. Please check file.');
}
