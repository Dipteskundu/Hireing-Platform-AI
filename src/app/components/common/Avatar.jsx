import Image from "next/image";
import { User } from "lucide-react";

/**
 * Reusable Avatar component for profile and navbar.
 * @param {string} src - The image URL.
 * @param {string} alt - Alt text for the image.
 * @param {string} size - size class for the container (e.g., 'w-10 h-10').
 * @param {string} className - Additional classes for the container.
 * @param {boolean} ring - Whether to show a ring around the avatar.
 */
const Avatar = ({ src, alt = "Profile", size = "w-10 h-10", className = "", ring = false }) => {
    return (
        <div className={`relative ${size} rounded-full overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center transition-all ${ring ? 'ring-2 ring-indigo-500 ring-offset-2' : ''} ${className}`}>
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            ) : (
                <User className="text-slate-300 w-1/2 h-1/2" />
            )}
        </div>
    );
};

export default Avatar;
