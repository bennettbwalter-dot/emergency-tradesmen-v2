
import os

path = "../src/components/EmergencyChatInterface.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Target the specific broken code identified by browser agent
old_snippet = """                                                        <TypewriterMessage
                                                            text={msg.content}
                                                            speed={15}
                                                            onType=
                                                </div>"""

new_snippet = """                                                        <TypewriterMessage
                                                            text={msg.content}
                                                            speed={15}
                                                            onType={() => scrollToBottom('auto')}
                                                        />
                                                    </div>"""

if old_snippet in content:
    content = content.replace(old_snippet, new_snippet)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Repaired TypewriterMessage in EmergencyChatInterface.tsx")
else:
    # Try more flexible match for onType= whitespace
    import re
    pattern = r'onType=\s*</div>'
    if re.search(pattern, content):
        content = re.sub(pattern, 'onType={() => scrollToBottom(\'auto\')}\n                                                        />\n                                                    </div>', content)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Repaired TypewriterMessage in EmergencyChatInterface.tsx (regex)")
    else:
        print("Could not find broken TypewriterMessage snippet")
