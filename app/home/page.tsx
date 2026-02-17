import { AuthenticatedHome } from "@/components/sections/authenticated-home";
import { Footer } from "@/components/layout/footer";

export default async function HomePage() {
    return (
        <>
            <AuthenticatedHome />
            <Footer />
        </>
    );
}
