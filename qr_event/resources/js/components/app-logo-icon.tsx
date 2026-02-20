import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="#fffc41">
            <path d="M446.503,141.994H320.017V0H192.015v141.994H49.497v128.01h142.518V512h128.002V269.996l142.486,0.008v-128.01 H446.503z M430.503,237.996H288.017V480h-64.001V237.996H81.497v-64.001h142.518V31.992h64.001v142.002h142.486V237.996z" />
        </svg>
    );
}
