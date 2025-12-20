import os

file_path = os.path.join('..', 'src', 'lib', 'subscriptionService.ts')

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update PLANS names
old_professional_name = "        name: 'Professional',"
new_professional_name = "        name: 'Pro Monthly',"

old_enterprise_name = "        name: 'Enterprise',"
new_enterprise_name = "        name: 'Pro Yearly',"

content = content.replace(old_professional_name, new_professional_name)
content = content.replace(old_enterprise_name, new_enterprise_name)

# 2. Update getPlanDisplayName
old_display_names = """export function getPlanDisplayName(planType: string): string {
    switch (planType) {
        case 'pro':
        case 'enterprise':
            return 'Pro (£99/year)';
        case 'basic':
        case 'professional':
            return 'Basic (£29/month)';
        default:
            return 'Basic';
    }
}"""

new_display_names = """export function getPlanDisplayName(planType: string): string {
    switch (planType) {
        case 'pro':
        case 'enterprise':
            return 'Pro Yearly (£99)';
        case 'basic':
        case 'professional':
            return 'Pro Monthly (£29)';
        default:
            return 'Basic';
    }
}"""

content = content.replace(old_display_names, new_display_names)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated subscriptionService.ts")
