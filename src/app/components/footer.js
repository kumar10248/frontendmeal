export default function Footer() {
    return (
      <footer className="w-full border-t py-6 bg-background">
        <div className="container flex flex-col items-center justify-center gap-2 md:flex-row md:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Meal Menu App. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Designed with ❤️ for hungry people
          </p>
        </div>
      </footer>
    )
  }