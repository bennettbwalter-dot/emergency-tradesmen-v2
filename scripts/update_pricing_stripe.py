import os

pricing_path = r"..\src\pages\PricingPage.tsx"

with open(pricing_path, "r", encoding="utf-8") as f:
    content = f.read()

# Update Monthly Link
old_monthly = "onClick={() => window.open('https://checkout.stripe.com/pay/23683af0-9b18-41a3-8d5f-3dec9f64c419', '_blank')}"
new_monthly = "onClick={() => window.open('https://buy.stripe.com/fZu5kD5bx00feTcfRZcQU00', '_blank')}"

# Update Yearly Link
old_yearly = "onClick={() => window.open('https://checkout.stripe.com/pay/17b71aef-f805-4974-a7fe-fb136b083b61', '_blank')}"
new_yearly = "onClick={() => window.open('https://buy.stripe.com/00w8wP47teV9bH0eNVcQU01', '_blank')}"

content = content.replace(old_monthly, new_monthly)
content = content.replace(old_yearly, new_yearly)

# Update the coming soon text
content = content.replace(
    "<p>Payment processing via Stripe coming soon. Contact us to set up your subscription.</p>",
    "<p>Secure payment processing via Stripe. Get listed and start receiving leads today.</p>"
)

with open(pricing_path, "w", encoding="utf-8") as f:
    f.write(content)

print("PricingPage updated with live Stripe links.")
