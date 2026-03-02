import { useState, useEffect } from 'react';

interface BackgroundSlideshowProps {
    images?: string[];
    interval?: number;
    overlayColor?: string;
    overlayOpacity?: number;
}

const defaultImages = [
    '/images/slideshow/slide1.jpg',
    '/images/slideshow/slide2.jpg',
    '/images/slideshow/slide3.jpg',
];

export default function BackgroundSlideshow({
    images = defaultImages,
    interval = 10000,
    overlayColor = '#000000',
    overlayOpacity = 0.5,
}: BackgroundSlideshowProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [prevImageIndex, setPrevImageIndex] = useState(0);
    const [direction, setDirection] = useState<'left' | 'right'>('right');

    useEffect(() => {
        if (images.length <= 1) return;

        const timer = setInterval(() => {
            setPrevImageIndex(currentImageIndex);
            setDirection('right');
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, interval);

        return () => clearInterval(timer);
    }, [images, interval, currentImageIndex]);

    if (images.length === 0) return null;

    return (
        <div className="fixed inset-0 z-0 w-full h-full min-h-screen overflow-hidden pointer-events-none" style={{minHeight: '100vh', height: '100%'}}>
            {images.map((image, index) => {
                // Only render current and previous for animation
                if (index !== currentImageIndex && index !== prevImageIndex) return null;
                const isCurrent = index === currentImageIndex;
                return (
                    <div
                        key={image}
                        className={`absolute top-0 left-0 w-full h-full min-h-screen bg-cover bg-center transition-opacity duration-1000 ease-in-out z-0
                            ${isCurrent ? 'opacity-100 animate-zoomfadein' : 'opacity-0 animate-zoomfadeout'}
                        `}
                        style={{
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url('${image}')`,
                            width: '100vw',
                            minHeight: '100vh',
                            height: '100%'
                        }}
                    />
                );
            })}
            <style>{`
                @keyframes zoomfadein {
                    from { transform: scale(1.08); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes zoomfadeout {
                    from { transform: scale(1); opacity: 1; }
                    to { transform: scale(1.08); opacity: 0; }
                }
                .animate-zoomfadein {
                    animation: zoomfadein 1.2s cubic-bezier(0.4,0,0.2,1);
                }
                .animate-zoomfadeout {
                    animation: zoomfadeout 1.2s cubic-bezier(0.4,0,0.2,1);
                }
            `}</style>
        </div>
    );
}
