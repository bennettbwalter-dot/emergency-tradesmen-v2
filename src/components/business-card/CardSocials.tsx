import { Business } from "@/lib/businesses";
import { GlassSocialIcon } from "@/components/ui/GlassSocialIcon";

interface CardSocialsProps {
    business: Business;
}

export function CardSocials({ business }: CardSocialsProps) {
    const { social_links } = business;

    const hasSocials = social_links && Object.values(social_links).some(link => !!link);

    return (
        <div className={`flex items-center justify-center gap-2 mt-3 px-1 min-h-[28px]`}>
            {hasSocials && (
                <>
                    {social_links.facebook && (
                        <GlassSocialIcon
                            platform="facebook"
                            href={social_links.facebook}
                            className="w-7 h-7 rounded-lg"
                        />
                    )}
                    {social_links.instagram && (
                        <GlassSocialIcon
                            platform="instagram"
                            href={social_links.instagram}
                            className="w-7 h-7 rounded-lg"
                        />
                    )}
                    {social_links.twitter && (
                        <GlassSocialIcon
                            platform="twitter"
                            href={social_links.twitter}
                            className="w-7 h-7 rounded-lg"
                        />
                    )}
                    {social_links.linkedin && (
                        <GlassSocialIcon
                            platform="linkedin"
                            href={social_links.linkedin}
                            className="w-7 h-7 rounded-lg"
                        />
                    )}
                    {social_links.tiktok && (
                        <GlassSocialIcon
                            platform="tiktok"
                            href={social_links.tiktok}
                            className="w-7 h-7 rounded-lg"
                        />
                    )}
                </>
            )}
        </div>
    );
}
