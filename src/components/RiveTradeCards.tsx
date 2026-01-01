import { useRive, Layout, Fit, Alignment } from '@rive-app/react';

export function RiveTradeCards() {
    const { RiveComponent } = useRive({
        src: '/trade-cards.riv',
        stateMachines: "State Machine 1", // Assuming default, will need verification
        autoplay: true,
        layout: new Layout({
            fit: Fit.Cover,
            alignment: Alignment.Center,
        }),
    });

    return (
        <div className="w-full aspect-video md:aspect-[16/9] lg:aspect-[21/9] h-[500px] md:h-[600px]">
            <RiveComponent className="w-full h-full" />
        </div>
    );
}
