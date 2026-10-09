import { LinkButton } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-text-2">The page you are looking for does not exist or has moved.</p>
      <LinkButton href="/" className="mt-8">
        Back to home
      </LinkButton>
    </Container>
  );
}
