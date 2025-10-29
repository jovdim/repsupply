import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
  Link as LinkIcon,
  Store,
  Blocks,
  LogIn,
} from "lucide-react";

export const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const location = useLocation();
  const toolsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolsRef.current &&
        !toolsRef.current.contains(event.target as Node)
      ) {
        setIsToolsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigation = [
    {
      name: "Products",
      href: "/products",
      icon: ShoppingBag,
      current: location.pathname === "/products",
    },
    {
      name: "Yupoo Store",
      href: "/yupoo",
      icon: Store,
      current: location.pathname === "/yupoo",
    },
    {
      name: "Link Converter",
      href: "/converter",
      icon: LinkIcon,
      current: location.pathname === "/converter",
    },
  ];

  const toolsDropdown = [
    {
      name: "Warning Remover",
      href: "https://chromewebstore.google.com/detail/njificdghacbdmdlpajkbojnhjfapplf?utm_source=item-share-cb",
      icon: Blocks,
      current: location.pathname === "/warning-remover",
    },
    // {
    //   name: "Other Tool 1",
    //   href: "/tool-1",
    //   icon: LinkIcon,
    // },
    // {
    //   name: "Other Tool 2",
    //   href: "/tool-2",
    //   icon: ShoppingBag,
    // },
  ];

  return (
    <nav className=" border-b  border-border/50 sticky top-0 z-50 backdrop-blur-md text-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="/repsupply.png"
                alt="RepSupply Logo"
                className="w-8 h-8 object-contain"
                width={32}
                height={32}
                loading="eager"
              />
            </div>

            {/* Text - Hidden on mobile */}
            <span className="text-lg font-bold text-text-primary hidden sm:block font-['Poetsen_One'] ">
              REPSUPPLY
            </span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4 flex-1 justify-center">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all  ${
                    item.current
                      ? "text-text-primary bg-bg-secondary"
                      : "text-text-secondary hover:text-bg-secondary "
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className="flex items-center px-3 py-2 rounded-lg font-medium text-text-primary hover:text-bg-secondary  transition-all cursor-pointer"
              >
                <span>More Tools</span>
                <ChevronDown
                  className={`w-4 h-4 ml-1 transition-transform ${
                    isToolsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isToolsOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl bg-bg-card border border-primary shadow-2xl z-50">
                  <div className="p-2">
                    {toolsDropdown.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsToolsOpen(false)}
                          className={`flex items-center px-3 py-3 rounded-lg text-text-primary transition-all group 
                            ${
                              item.current
                                ? "text-text-primary bg-bg-secondary"
                                : "text-text-secondary hover:text-bg-secondary "
                            }
                            `}
                        >
                          <Icon className="w-4 h-4 mr-3  " />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Login Button */}
          <div className="flex items-center space-x-4">
            <button className="group hidden sm:flex items-center justify-center gap-2 bg-bg-secondary text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 hover:bg-bg-hover hover:scale-[1.02] active:scale-95 cursor-pointer">
              <span>Login</span>
              <LogIn className="w-4 h-4 text-text-primary -mb-1" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 text-text-secondary "
            >
              {isMobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-border ">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Main Navigation Items */}
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-lg font-medium  ${
                    item.current
                      ? "bg-bg-secondary text-white"
                      : "text-text-secondary "
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}

            {/* Tools Dropdown Items */}
            {toolsDropdown.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-lg font-medium text-text-secondary 
                    
                    ${
                      item.current
                        ? "text-text-primary bg-bg-secondary"
                        : "text-text-secondary hover:text-bg-secondary "
                    }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}

            {/* Mobile Login Button */}
            <div className="pt-4 border-t border-border">
              <button className="w-full bg-bg-secondary text-white px-4 py-3 rounded-lg font-medium ">
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
