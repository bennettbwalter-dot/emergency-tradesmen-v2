import { FiCircle, FiFileText, FiLayers } from 'react-icons/fi';
import Carousel from "@/components/ui/Carousel";
import { useIsMobile } from "@/hooks/use-mobile";

export function HowItWorksSection() {
    const isMobile = useIsMobile();

    return (
        <section className="container-wide py-24 border-t font-display border-border/30">
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-display tracking-wide mb-4">
                        The Modern Way to verify <br /> <span className="text-gold">Trusted Tradesmen</span>
                    </h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto rounded-full" />
                </div>

                <div className="w-fit max-w-[800px] relative rounded-3xl border border-white/10 bg-black shadow-none md:shadow-xl md:shadow-gold/5 mx-auto overflow-hidden">
                    <Carousel
                        items={[
                            {
                                title: 'How It Works',
                                description: 'Watch our guide on how to find a tradesman.',
                                id: 0,
                                icon: <FiLayers className="h-4 w-4 text-white" />,
                                imageSrc: "/images/et-tv-screen-v2.jpg"
                            },
                            {
                                title: 'Picture Connect',
                                description: 'Seamlessly connect with tradesmen via images.',
                                id: 0.1,
                                icon: <FiLayers className="h-4 w-4 text-white" />,
                                videoSrc: "/picture-connect.mp4"
                            },
                            {
                                title: 'Drop-Down Connect',
                                description: 'Easy selection process for your specific needs.',
                                id: 0.2,
                                icon: <FiLayers className="h-4 w-4 text-white" />,
                                videoSrc: "/drop-down.mp4"
                            },
                            {
                                title: 'Describe Problem',
                                description: 'Type out your issue for quick matching.',
                                id: 0.3,
                                icon: <FiFileText className="h-4 w-4 text-white" />,
                                videoSrc: "/type.mp4"
                            },
                            {
                                title: 'Voice Agent',
                                description: 'Use voice commands to find help.',
                                id: 0.4,
                                icon: <FiCircle className="h-4 w-4 text-white" />,
                                videoSrc: "/voice.mp4"
                            }
                        ]}
                        baseWidth={isMobile ? 360 : 800}
                        autoplay={false}
                        pauseOnHover={true}
                        loop={true}
                        round={false}
                    />
                </div>
            </div>
        </section>
    );
}
