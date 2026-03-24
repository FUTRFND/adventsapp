import adventsLogo from "@/assets/advents-logo.jpeg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: ["Features", "Pricing", "Vendor Marketplace", "Mobile App"],
    Company: ["About Us", "Careers", "Blog", "Press"],
    Resources: ["Help Center", "Planning Guides", "Vendor Resources", "API"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  };

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={adventsLogo}
                alt="Advents"
                className="h-10 w-10 rounded-lg object-cover"
              />
              <span className="text-xl font-semibold tracking-tight text-foreground">
                Advents
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Event-Planning Simplified. Plan any occasion in minutes with
              AI-powered tools and a curated vendor marketplace.
            </p>
            <div className="flex gap-4">
              {["Twitter", "LinkedIn", "Instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Advents. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with care for event planners everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
