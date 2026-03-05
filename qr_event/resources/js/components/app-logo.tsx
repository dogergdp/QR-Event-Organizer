export default function AppLogo() {
    return (
        <div className="flex items-center">
            <img
                src="/images/ccf-logo.png"
                alt="Logo"
                className="h-10 w-auto object-contain rounded-sm"
            />
            <p className="ml-2 text-lg font-black text-white">CCF Las Pinas</p>
        </div>
    );
}
