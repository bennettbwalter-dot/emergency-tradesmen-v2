import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  trade: string;
  city: string;
}

export function FAQSection({ faqs, trade, city }: FAQSectionProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
        Frequently Asked Questions
      </h2>
      
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`faq-${index}`}
            className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
          >
            <AccordionTrigger className="text-left font-medium py-5 hover:no-underline hover:text-accent">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-5">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
